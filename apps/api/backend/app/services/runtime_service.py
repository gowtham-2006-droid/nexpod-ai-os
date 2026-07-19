from __future__ import annotations
import dataclasses
from dataclasses import asdict
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from pod_runtime import PodRuntimeEngine, SimulationConfig, SimulationProfile
from ..database.session import get_session_factory
from ..repositories.runtime_repository import RuntimeRepository


class RuntimeService:
    """Single process authority for all simulated pod business state."""
    def __init__(self) -> None:
        self._lock = RLock()
        self.engine = PodRuntimeEngine(config=SimulationConfig(profile=SimulationProfile.EVENING_RUSH, demo_mode=True))
        
        # Runtime session telemetry properties
        self.startup_time = datetime.now(timezone.utc)
        self.ticks_count = 0
        self.last_tick = self.startup_time
        
        # Local settings defaults
        self.settings = {
            "pod_name": "NexPod Atrium",
            "simulation_mode": "Evening Rush",
            "alerts_inventory": True,
            "alerts_maintenance": True,
            "alerts_revenue": True,
            "notify_email": True,
            "notify_push": True,
            "ai_enabled": True,
            "ai_auto_reorder": True,
            "insight_frequency": "15 min",
            "confidence_threshold": 90
        }

    def snapshot(self):
        with self._lock:
            return self.engine.get_snapshot()

    def advance(self, minutes: int = 1):
        with self._lock:
            snapshot = self.engine.tick(minutes)
            self.ticks_count += minutes
            self.last_tick = datetime.now(timezone.utc)
            
            # If AI auto-reorder is enabled, check for low inventory and replenish
            if self.settings.get("ai_auto_reorder"):
                for pod in snapshot.pods:
                    for item in pod.inventory:
                        if item.quantity <= item.reorder_point:
                            self.engine.replenish_inventory(pod.id, item.sku)
                snapshot = self.engine.get_snapshot()
                
        self._persist(snapshot)
        return snapshot

    def create_order(self, pod_id: str, sku: str, quantity: int):
        with self._lock:
            order = self.engine.place_order(pod_id, sku, quantity)
            snapshot = self.engine.get_snapshot()
            
            # If AI auto-reorder is enabled, check for low inventory and replenish
            if self.settings.get("ai_auto_reorder"):
                for pod in snapshot.pods:
                    for item in pod.inventory:
                        if item.quantity <= item.reorder_point:
                            self.engine.replenish_inventory(pod.id, item.sku)
                snapshot = self.engine.get_snapshot()
                
        self._persist(snapshot)
        return order

    def replenish_inventory(self, pod_id: str, sku: str | None = None):
        with self._lock:
            pod_snapshot = self.engine.replenish_inventory(pod_id, sku)
            snapshot = self.engine.get_snapshot()
        self._persist(snapshot)
        return pod_snapshot

    def _persist(self, snapshot) -> None:
        factory = get_session_factory()
        if not factory:
            return
        with factory() as session:
            RuntimeRepository(session).save(snapshot, self.intelligence())

    def update_settings(self, data: dict) -> dict:
        with self._lock:
            self.settings.update(data)
            
            # Map simulation mode to Profile enum and override engine
            mode = data.get("simulation_mode")
            if mode:
                profile = SimulationProfile.EVENING_RUSH
                if mode == "Morning":
                    profile = SimulationProfile.MORNING
                elif mode == "Afternoon":
                    profile = SimulationProfile.AFTERNOON
                
                # Replace engine configuration profile
                self.engine.config = dataclasses.replace(self.engine.config, profile=profile)
                self.engine._orders_per_hour = self.engine._profile_orders_per_hour()
                
            return self.settings

    def runtime_info(self) -> dict[str, Any]:
        snapshot = self.snapshot()
        delta = datetime.now(timezone.utc) - self.startup_time
        hours, remainder = divmod(int(delta.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)
        uptime_str = f"{hours:02}:{minutes:02}:{seconds:02}"
        profile_name = self.settings["simulation_mode"]
        
        return {
            "engineStatus": "Running",
            "simulationMode": profile_name,
            "runtimeTick": self.ticks_count,
            "uptime": uptime_str,
            "ordersGenerated": snapshot.metrics.order_count,
            "lastTick": self.last_tick.isoformat(),
            "profile": profile_name,
            "engineVersion": "1.0",
            "backendStatus": "Healthy"
        }

    def dashboard(self) -> dict[str, Any]:
        snapshot = self.snapshot()
        pod = snapshot.pods[0]
        inventory_health = round(sum(item.quantity / item.capacity for item in pod.inventory) / len(pod.inventory) * 100, 1)
        return {
            "revenue": snapshot.metrics.gross_revenue_inr, "orders": snapshot.metrics.order_count,
            "machineHealth": round(pod.health.score, 1), "inventoryHealth": inventory_health,
            "alerts": len(snapshot.alerts), "customerRating": 4.88,
            "simulationMode": self.settings["simulation_mode"], "podStatus": pod.status.value.title(),
            "lastUpdated": snapshot.simulated_at,
            "aiInsight": self.intelligence(),
        }

    def intelligence(self) -> dict[str, Any]:
        snapshot = self.snapshot()
        low = [item for pod in snapshot.pods for item in pod.inventory if item.quantity <= item.reorder_point]
        
        alerts_list = []
        for a in snapshot.alerts:
            alerts_list.append({
                "id": a.id,
                "pod_id": a.pod_id,
                "severity": a.severity.value,
                "code": a.code,
                "message": a.message,
                "opened_at": a.opened_at.isoformat() if isinstance(a.opened_at, datetime) else str(a.opened_at),
                "active": a.active
            })
            
        return {
            "priority": "HIGH" if low else "LOW", "risk": "MEDIUM" if low else "LOW", "confidence": self.settings["confidence_threshold"],
            "message": "Milk inventory will fall below the safe threshold in 2.8 hours." if snapshot.alerts else "All core materials are nominal.",
            "action": "Refill before 5:30 PM" if snapshot.alerts else "Continue monitoring",
            "context": {"active_alerts": alerts_list, "low_stock": [asdict(i) for i in low]},
        }

    def orders(self, limit: int = 100):
        return self.engine.get_orders(limit)

    def factory_reset(self):
        with self._lock:
            self.engine = PodRuntimeEngine(config=SimulationConfig(profile=SimulationProfile.EVENING_RUSH, demo_mode=True))
            self.ticks_count = 0
            self.last_tick = datetime.now(timezone.utc)
            self.settings = {
                "pod_name": "NexPod Atrium",
                "simulation_mode": "Evening Rush",
                "alerts_inventory": True,
                "alerts_maintenance": True,
                "alerts_revenue": True,
                "notify_email": True,
                "notify_push": True,
                "ai_enabled": True,
                "ai_auto_reorder": True,
                "insight_frequency": "15 min",
                "confidence_threshold": 90
            }
            snapshot = self.engine.get_snapshot()
        self._persist(snapshot)
        return self.settings


runtime_service = RuntimeService()
