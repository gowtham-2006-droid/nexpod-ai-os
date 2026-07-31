"""
NexPod AI OS — Real-Time WebSocket Telemetry Gateway
=====================================================
Exposes a WebSocket endpoint at  ws://<host>/ws/telemetry

Every connected browser receives a rich JSON push on every simulation tick,
eliminating the need for repeated HTTP polling from the frontend.

Message schema (type: "telemetry_snapshot"):
{
  "type":      "telemetry_snapshot",
  "tick":      <int>,
  "timestamp": "<ISO-8601 UTC>",
  "telemetry": [{ pod_id, temperature_c, power_draw_w, network_latency_ms }],
  "dashboard": { revenue, orders, machineHealth, inventoryHealth, alerts, podStatus, simulationMode },
  "runtime":   { runtimeTick, uptime, simulationMode, ordersGenerated, engineStatus },
  "health":    { backendStatus, databaseStatus, runtimeStatus, apiStatus },
  "anomaly":   { model_status, anomaly_detected, composite_risk_score, confidence, diagnosis, ... }
}

Error/heartbeat messages:
  { "type": "ping",  "timestamp": "<ISO>" }
  { "type": "error", "message": "<reason>" }
"""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

ws_router = APIRouter(tags=["WebSocket"])

# ---------------------------------------------------------------------------
# Connection Manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    """
    Thread-safe registry of active WebSocket clients.

    broadcast() is the only write path — it serialises once and fans out
    to all connected sockets. Disconnected clients are removed silently.
    """

    def __init__(self) -> None:
        self._clients: list[WebSocket] = []
        self._lock = asyncio.Lock()
        self.tick_count: int = 0

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._clients.append(websocket)
        logger.info(
            "WS: Client connected. Total connections: %d", len(self._clients)
        )

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self._clients:
                self._clients.remove(websocket)
        logger.info(
            "WS: Client disconnected. Total connections: %d", len(self._clients)
        )

    async def broadcast(self, payload: dict) -> None:
        """Serialise once and send to all connected clients."""
        if not self._clients:
            return
        message = json.dumps(payload, default=str)
        dead: list[WebSocket] = []
        async with self._lock:
            targets = list(self._clients)
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    if ws in self._clients:
                        self._clients.remove(ws)
            logger.info("WS: Removed %d stale connections.", len(dead))

    @property
    def connection_count(self) -> int:
        return len(self._clients)


# Module-level singleton shared with main.py tick loop
ws_manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Snapshot builder
# ---------------------------------------------------------------------------

def _build_snapshot(tick: int) -> dict[str, Any]:
    """
    Compile a rich, cross-domain telemetry payload from all live services.
    Called by the tick loop; must be synchronous (no async DB calls).
    """
    from ..services.runtime_service import runtime_service
    from ..services.anomaly_service import anomaly_service

    snapshot = runtime_service.snapshot()
    runtime_info = runtime_service.runtime_info()
    anomaly_report = anomaly_service.get_report()

    # --- Telemetry ---
    telemetry = [
        {
            "pod_id": pod.id,
            "recorded_at": snapshot.simulated_at.isoformat(),
            "temperature_c": pod.health.temperature_c,
            "power_draw_w": pod.health.power_draw_w,
            "network_latency_ms": pod.health.network_latency_ms,
        }
        for pod in snapshot.pods
    ]

    # --- Dashboard KPIs ---
    pod = snapshot.pods[0] if snapshot.pods else None
    inventory_health = 100.0
    if pod:
        inventory_health = round(
            sum(item.quantity / item.capacity for item in pod.inventory)
            / len(pod.inventory)
            * 100,
            1,
        )

    dashboard = {
        "revenue": snapshot.metrics.gross_revenue_inr,
        "orders": snapshot.metrics.order_count,
        "machineHealth": round(pod.health.score, 1) if pod else 100.0,
        "inventoryHealth": inventory_health,
        "alerts": len(snapshot.alerts),
        "podStatus": pod.status.value.title() if pod else "Unknown",
        "simulationMode": runtime_info.get("simulationMode", "Unknown"),
        "averageOrderValue": snapshot.metrics.average_order_value_inr,
    }

    # --- Active alerts (lightweight) ---
    alerts = [
        {
            "id": a.id,
            "code": a.code,
            "severity": a.severity.value,
            "message": a.message,
        }
        for a in snapshot.alerts
    ]

    # --- Inventory levels ---
    inventory = []
    if pod:
        inventory = [
            {
                "sku": item.sku,
                "name": item.name,
                "quantity": item.quantity,
                "capacity": item.capacity,
                "reorder_point": item.reorder_point,
            }
            for item in pod.inventory
        ]

    return {
        "type": "telemetry_snapshot",
        "tick": tick,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "telemetry": telemetry,
        "dashboard": dashboard,
        "alerts": alerts,
        "inventory": inventory,
        "runtime": {
            "runtimeTick": runtime_info.get("runtimeTick", 0),
            "uptime": runtime_info.get("uptime", "00:00:00"),
            "simulationMode": runtime_info.get("simulationMode", "Unknown"),
            "ordersGenerated": runtime_info.get("ordersGenerated", 0),
            "engineStatus": runtime_info.get("engineStatus", "Running"),
        },
        "health": {
            "backendStatus": "Healthy",
            "runtimeStatus": "Running",
        },
        "anomaly": {
            "model_status": anomaly_report.get("model_status", "warming_up"),
            "anomaly_detected": anomaly_report.get("anomaly_detected", False),
            "composite_risk_score": anomaly_report.get("composite_risk_score", 0.0),
            "confidence": anomaly_report.get("confidence", 0.0),
            "diagnosis": anomaly_report.get("diagnosis", ""),
            "samples_collected": anomaly_report.get("samples_collected", 0),
            "generated_by": anomaly_report.get("generated_by", "ZScore"),
        },
    }


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------

@ws_router.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket) -> None:
    """
    Persistent WebSocket connection for real-time telemetry streaming.

    - On connect: sends an immediate `connected` handshake + current snapshot.
    - Receives tick broadcasts from main.py's tick_loop via ws_manager.broadcast().
    - Responds to client `ping` messages with a `pong`.
    - Cleans up on disconnect or error.
    """
    await ws_manager.connect(websocket)

    # Send immediate snapshot on connect so the UI doesn't have to wait 5s
    try:
        initial = _build_snapshot(ws_manager.tick_count)
        initial["type"] = "connected"
        await websocket.send_text(json.dumps(initial, default=str))
    except Exception as e:
        logger.warning("WS: Failed to send initial snapshot: %s", e)

    try:
        # Keep the connection alive; incoming messages are handled here.
        # The broadcast is driven externally by tick_loop() in main.py.
        while True:
            try:
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                msg = json.loads(raw)
                if msg.get("type") == "ping":
                    await websocket.send_text(
                        json.dumps({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
                    )
            except asyncio.TimeoutError:
                # No message from client in 60s — send server-side ping
                try:
                    await websocket.send_text(
                        json.dumps({"type": "ping", "timestamp": datetime.now(timezone.utc).isoformat()})
                    )
                except Exception:
                    break
    except WebSocketDisconnect:
        logger.info("WS: Client initiated clean disconnect.")
    except Exception as e:
        logger.warning("WS: Connection error: %s", e)
    finally:
        await ws_manager.disconnect(websocket)


# ---------------------------------------------------------------------------
# Status endpoint (REST)
# ---------------------------------------------------------------------------

@ws_router.get("/ws/status", summary="WebSocket connection stats")
def ws_status() -> dict:
    """Returns current WebSocket connection metrics."""
    return {
        "active_connections": ws_manager.connection_count,
        "total_ticks_broadcast": ws_manager.tick_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
