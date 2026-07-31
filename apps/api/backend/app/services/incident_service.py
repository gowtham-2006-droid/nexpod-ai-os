"""
NexPod AI OS — Incident Replay Engine
=====================================
Lightweight operational event recorder maintaining a circular buffer
of the last 200 events for state transition replay.
"""

from __future__ import annotations

import logging
import threading
from collections import deque
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any

logger = logging.getLogger(__name__)

MAX_INCIDENT_EVENTS = 200


@dataclass
class IncidentMetadata:
    podId: str = "pod-001"
    podName: str = "NexPod Atrium"
    severity: str = "info"  # "info" | "warning" | "critical"
    snapshot: dict[str, Any] = field(default_factory=dict)


@dataclass
class IncidentEvent:
    id: str
    timestamp: str  # ISO8601
    type: str       # "telemetry" | "inventory" | "order" | "diagnostic" | "ai" | "alert" | "maintenance"
    title: string
    description: str
    metadata: IncidentMetadata


class IncidentReplayService:
    """
    Circular-buffer incident recorder for NexPod AI OS.
    Records backend state transitions, telemetry bursts, AI insights,
    and diagnostic alerts for step-by-step UI replay.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._buffer: deque[IncidentEvent] = deque(maxlen=MAX_INCIDENT_EVENTS)
        self._counter: int = 0
        self._seed_initial_history()

    def record_event(
        self,
        event_type: str,
        title: str,
        description: str,
        severity: str = "info",
        pod_id: str = "pod-001",
        pod_name: str = "NexPod Atrium",
        snapshot: dict[str, Any] | None = None,
        timestamp: datetime | None = None,
    ) -> IncidentEvent:
        """Record a single operational incident event into the circular buffer."""
        ts = timestamp or datetime.now(timezone.utc)
        with self._lock:
            self._counter += 1
            event_id = f"evt-{self._counter:04d}"
            evt = IncidentEvent(
                id=event_id,
                timestamp=ts.isoformat(),
                type=event_type,
                title=title,
                description=description,
                metadata=IncidentMetadata(
                    podId=pod_id,
                    podName=pod_name,
                    severity=severity,
                    snapshot=snapshot or {},
                ),
            )
            self._buffer.append(evt)
            return evt

    def get_incidents(self) -> dict[str, Any]:
        """Return all recorded incident events sorted chronologically."""
        with self._lock:
            events_list = [asdict(e) for e in self._buffer]
            # Ensure chronological order
            events_list.sort(key=lambda x: x["timestamp"])
            return {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "events": events_list,
            }

    def ingest_from_snapshot(self, runtime_snapshot) -> None:
        """
        Extract real-time operational events from tick snapshots.
        Called on every simulation tick in main.py.
        """
        if not runtime_snapshot or not runtime_snapshot.pods:
            return

        pod = runtime_snapshot.pods[0]
        ts = runtime_snapshot.simulated_at

        # Check for low inventory items
        for item in pod.inventory:
            if item.quantity <= item.reorder_point and item.quantity > 0:
                self._record_unique_live_event(
                    f"inv-low-{item.sku}",
                    "inventory",
                    "Inventory Alert",
                    f"{item.name} level dropped to {item.quantity}/{item.capacity} units.",
                    "warning",
                    pod.id,
                    pod.name,
                    {
                        "inventoryHealth": round((item.quantity / item.capacity) * 100, 1),
                        "machineHealth": round(pod.health.score, 1),
                        "temperature_c": round(pod.health.temperature_c, 1),
                        "alertMessage": f"{item.name} stock level low ({item.quantity} remaining)",
                    },
                    ts,
                )

        # Check temperature anomalies
        if pod.health.temperature_c > 75.0:
            self._record_unique_live_event(
                f"telemetry-temp-{int(ts.timestamp()) // 30}",
                "telemetry",
                "Thermal Surge",
                f"Boiler core temperature elevated to {pod.health.temperature_c:.1f}°C.",
                "warning",
                pod.id,
                pod.name,
                {
                    "temperature_c": round(pod.health.temperature_c, 1),
                    "power_draw_w": round(pod.health.power_draw_w, 1),
                    "machineHealth": round(pod.health.score, 1),
                },
                ts,
            )

    def _record_unique_live_event(
        self,
        dedup_key: str,
        event_type: str,
        title: str,
        description: str,
        severity: str,
        pod_id: str,
        pod_name: str,
        snapshot: dict[str, Any],
        ts: datetime,
    ) -> None:
        """Avoid duplicate entries within recent buffer window."""
        with self._lock:
            for e in reversed(self._buffer):
                if e.title == title and e.type == event_type:
                    # Don't duplicate same event within 60s
                    return
        self.record_event(
            event_type, title, description, severity, pod_id, pod_name, snapshot, ts
        )

    def _seed_initial_history(self) -> None:
        """
        Seed realistic operational timeline events representing the narrative:
        High order demand → Milk inventory depletion → Thermal load spike → Anomaly flag → AI Root Cause → Service Dispatch.
        """
        now = datetime.now(timezone.utc)

        seed_events = [
            (
                now - timedelta(minutes=15),
                "order",
                "Orders Demand Spike",
                "120 cups served. Evening Rush profile active — high espresso and cappuccino demand.",
                "info",
                {
                    "orders": 120,
                    "revenue": 14200,
                    "machineHealth": 98.5,
                    "inventoryHealth": 92.0,
                    "temperature_c": 64.2,
                    "power_draw_w": 2100,
                    "aiInsight": "Nominal operational status. Processing evening peak demand.",
                },
            ),
            (
                now - timedelta(minutes=11, seconds=30),
                "inventory",
                "Inventory Threshold",
                "Milk reserve level dropped below 60% capacity threshold (4.2L remaining).",
                "warning",
                {
                    "orders": 134,
                    "revenue": 15850,
                    "machineHealth": 96.0,
                    "inventoryHealth": 58.4,
                    "temperature_c": 68.5,
                    "power_draw_w": 2350,
                    "aiInsight": "Milk consumption rate is 2.4x baseline due to cappuccino volume.",
                },
            ),
            (
                now - timedelta(minutes=7, seconds=45),
                "telemetry",
                "Boiler Temp Surge",
                "Continuous steaming cycles increased boiler core temperature to 84.6°C (+16.4°C over baseline).",
                "warning",
                {
                    "orders": 148,
                    "revenue": 17400,
                    "machineHealth": 91.2,
                    "inventoryHealth": 45.0,
                    "temperature_c": 84.6,
                    "power_draw_w": 2850,
                    "network_latency_ms": 18,
                    "aiInsight": "Boiler thermal duty cycle at 88%. Monitoring heat dissipation.",
                },
            ),
            (
                now - timedelta(minutes=4, seconds=15),
                "diagnostic",
                "Anomaly Flagged",
                "IsolationForest engine flagged multivariate anomaly (Isolation Forest decision score: -0.24, z=3.2σ).",
                "critical",
                {
                    "orders": 156,
                    "revenue": 18350,
                    "machineHealth": 84.0,
                    "inventoryHealth": 38.0,
                    "temperature_c": 92.4,
                    "power_draw_w": 3100,
                    "alertMessage": "CRITICAL — Thermal & inventory rate anomaly detected by Isolation Forest engine.",
                    "aiInsight": "MULTIVARIATE ANOMALY DETECTED: Heat accumulation correlated with high milk pump cycles.",
                },
            ),
            (
                now - timedelta(minutes=2, seconds=10),
                "ai",
                "AI Root Cause Analysis",
                "Root Cause: High order volume accelerated milk depletion causing increased boiler thermal cycles.",
                "warning",
                {
                    "orders": 162,
                    "revenue": 19100,
                    "machineHealth": 82.5,
                    "inventoryHealth": 32.0,
                    "temperature_c": 88.1,
                    "power_draw_w": 2700,
                    "alertMessage": "WARNING — Milk replenishment required before 18:00 UTC.",
                    "aiInsight": "ROOT CAUSE CONFIRMED: Accelerated steam valve operation driven by evening rush menu choices.",
                },
            ),
            (
                now - timedelta(seconds=45),
                "maintenance",
                "Service Dispatch Queued",
                "Autonomous route dispatch scheduled. Inspection & milk replenishment recommended within 8 hours.",
                "info",
                {
                    "orders": 165,
                    "revenue": 19450,
                    "machineHealth": 85.0,
                    "inventoryHealth": 30.0,
                    "temperature_c": 76.2,
                    "power_draw_w": 2200,
                    "alertMessage": "INFO — Vehicle route optimized: Drone #1 queued for 14.2 km delivery route.",
                    "aiInsight": "VRP dispatch route generated. Drone delivery estimated arrival in 38 mins.",
                },
            ),
        ]

        for ts, event_type, title, desc, severity, snapshot in seed_events:
            self.record_event(
                event_type=event_type,
                title=title,
                description=desc,
                severity=severity,
                pod_id="pod-001",
                pod_name="NexPod Atrium",
                snapshot=snapshot,
                timestamp=ts,
            )


# Module-level singleton
incident_service = IncidentReplayService()
