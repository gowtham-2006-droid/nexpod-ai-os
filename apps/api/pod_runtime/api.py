"""REST read model over the authoritative PodRuntimeEngine."""
from __future__ import annotations

import os
from dataclasses import asdict
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.encoders import jsonable_encoder

from .engine import PodRuntimeEngine
from .persistence import RuntimeSnapshotRepository, SupabasePostgresRepository


class RuntimeApplication:
    """Coordinates runtime advancement and durable projection without dual writes."""

    def __init__(self, engine: PodRuntimeEngine, repository: RuntimeSnapshotRepository | None = None) -> None:
        self.engine = engine
        self.repository = repository

    def snapshot(self):
        return self.engine.get_snapshot()

    def tick(self, minutes: int = 1):
        snapshot = self.engine.tick(minutes)
        if self.repository:
            self.repository.save_snapshot(snapshot)
        return snapshot

    def persist_current_state(self) -> None:
        if self.repository:
            self.repository.save_snapshot(self.engine.get_snapshot())


def create_app(runtime: RuntimeApplication | None = None) -> FastAPI:
    """Create transport-only APIs; no endpoint reads PostgreSQL as authoritative state."""
    if runtime is None:
        url = os.getenv("SUPABASE_DB_URL")
        repository = SupabasePostgresRepository(url) if url else None
        runtime = RuntimeApplication(PodRuntimeEngine(), repository)

    app = FastAPI(title="NexPod Pod Runtime API", version="1.0.0")

    @app.on_event("startup")
    def persist_boot_snapshot() -> None:
        runtime.persist_current_state()

    @app.get("/api/v1/dashboard")
    def dashboard() -> dict[str, Any]:
        return _encode(runtime.snapshot())

    @app.get("/api/v1/orders")
    def orders(limit: int = Query(default=50, ge=1, le=500)) -> dict[str, Any]:
        return {"orders": _encode(runtime.engine.get_orders(limit)), "currency": "INR"}

    @app.get("/api/v1/pods/{pod_id}/inventory")
    def inventory(pod_id: str) -> dict[str, Any]:
        pod = _pod_or_404(runtime, pod_id)
        return {"pod_id": pod.id, "inventory": _encode(pod.inventory), "currency": "INR"}

    @app.get("/api/v1/pods/{pod_id}/machine-health")
    def machine_health(pod_id: str) -> dict[str, Any]:
        pod = _pod_or_404(runtime, pod_id)
        return {"pod_id": pod.id, "status": pod.status.value, "health": _encode(pod.health)}

    @app.get("/api/v1/alerts")
    def alerts(pod_id: str | None = None) -> dict[str, Any]:
        active = runtime.snapshot().alerts
        if pod_id:
            active = tuple(alert for alert in active if alert.pod_id == pod_id)
        return {"alerts": _encode(active)}

    @app.get("/api/v1/ai-context")
    def ai_context() -> dict[str, Any]:
        snapshot = runtime.snapshot()
        low_stock = [
            {"pod_id": pod.id, "sku": item.sku, "quantity": item.quantity, "reorder_point": item.reorder_point}
            for pod in snapshot.pods for item in pod.inventory if item.quantity <= item.reorder_point
        ]
        return {
            "generated_at": snapshot.simulated_at,
            "currency": snapshot.metrics.currency,
            "operational_summary": {
                "orders": snapshot.metrics.order_count,
                "gross_revenue_inr": snapshot.metrics.gross_revenue_inr,
                "average_order_value_inr": snapshot.metrics.average_order_value_inr,
                "active_alert_count": len(snapshot.alerts),
            },
            "pod_health": [{"pod_id": pod.id, "status": pod.status.value, "score": pod.health.score} for pod in snapshot.pods],
            "low_stock": low_stock,
            "active_alerts": _encode(snapshot.alerts),
            "instruction": "Use this factual context to explain operations. Do not invent orders, alerts, or device states.",
        }

    @app.post("/api/v1/simulation/tick")
    def advance_simulation(minutes: int = Query(default=1, ge=1, le=1440)) -> dict[str, Any]:
        """Demo/scheduler hook. Production scheduling should invoke this internally."""
        return _encode(runtime.tick(minutes))

    return app


def _pod_or_404(runtime: RuntimeApplication, pod_id: str):
    for pod in runtime.snapshot().pods:
        if pod.id == pod_id:
            return pod
    raise HTTPException(status_code=404, detail=f"Unknown pod: {pod_id}")


def _encode(value: object) -> Any:
    return jsonable_encoder(asdict(value) if hasattr(value, "__dataclass_fields__") else value)
