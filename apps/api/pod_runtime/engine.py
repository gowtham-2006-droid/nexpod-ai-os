from __future__ import annotations

import random
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable, Iterable

from .models import (
    Alert, AlertSeverity, EventType, InventoryItem, MachineHealth, Order,
    PodSnapshot, PodStatus, RevenueMetrics, RuntimeEvent, RuntimeSnapshot, SimulationProfile,
)

EventListener = Callable[[RuntimeEvent], None]

_CUSTOMER_NAMES = (
    "Aarav Sharma", "Aditya Rao", "Amit Saxena", "Ananya Sen", "Arjun Verma",
    "Dev Malhotra", "Ishaan Patel", "Kabir Gupta", "Neha Patel", "Pooja Hegde",
    "Priya Sharma", "Rahul Kapoor", "Rohan Gupta", "Siddharth Malhotra", "Sneha Nair",
    "Varun Dhawan", "Vikram Malhotra", "Karan Johar", "Aditi Rao", "Rajesh Kumar"
)
_PAYMENT_METHODS = ("UPI", "Card", "Cash")
_STATUS_OPTIONS = ("completed", "completed", "completed", "completed", "preparing", "pending")



@dataclass(frozen=True)
class SimulationConfig:
    seed: int | None = None
    profile: SimulationProfile = SimulationProfile.EVENING_RUSH
    orders_per_hour: int | None = None
    demo_mode: bool = True
    alert_history_limit: int = 100
    recent_order_limit: int = 50


@dataclass
class _PodState:
    id: str
    name: str
    inventory: dict[str, InventoryItem]
    health: MachineHealth


class PodRuntimeEngine:
    """In-memory, deterministic autonomous pod simulator.

    Call tick() from a scheduler (or tests) to advance simulated time. All public
    read methods return immutable snapshots, so dashboard consumers cannot mutate
    runtime state. Methods are deliberately transport-neutral for REST/WebSocket use.
    """

    def __init__(self, pods: Iterable[PodSnapshot] | None = None,
                 config: SimulationConfig | None = None) -> None:
        self.config = config or SimulationConfig()
        self._rng = random.Random(self.config.seed)
        self._now = datetime.now(timezone.utc)
        self._listeners: list[EventListener] = []
        self._orders: list[Order] = []
        self._alerts: dict[tuple[str, str], Alert] = {}
        self._revenue_inr = 0
        self._pods = self._load_pods(pods or self._default_pods())
        self._orders_per_hour = self.config.orders_per_hour or self._profile_orders_per_hour()
        if self._orders_per_hour < 0:
            raise ValueError("orders_per_hour cannot be negative")
        if self.config.demo_mode:
            self._seed_demo_alerts()

    def subscribe(self, listener: EventListener) -> Callable[[], None]:
        """Subscribe to domain events; returns an unsubscribe callback."""
        self._listeners.append(listener)
        def unsubscribe() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)
        return unsubscribe

    def tick(self, minutes: int = 1) -> RuntimeSnapshot:
        if minutes < 1:
            raise ValueError("minutes must be at least 1")
        for _ in range(minutes):
            self._now += timedelta(minutes=1)
            for pod in self._pods.values():
                self._update_health(pod)
                self._maybe_generate_order(pod)
                self._evaluate_alerts(pod)
        return self.get_snapshot()

    def get_snapshot(self) -> RuntimeSnapshot:
        pods = tuple(self._pod_snapshot(pod) for pod in self._pods.values())
        count = len(self._orders)
        active = tuple(alert for alert in self._alerts.values() if alert.active)
        return RuntimeSnapshot(
            simulated_at=self._now, pods=pods,
            metrics=RevenueMetrics("INR", self._revenue_inr, count,
                                   self._revenue_inr // count if count else 0),
            alerts=active, recent_orders=tuple(self._orders[-self.config.recent_order_limit:]),
        )

    def get_orders(self, limit: int = 50) -> tuple[Order, ...]:
        """Return newest-first orders from the authoritative runtime state."""
        if limit < 1:
            raise ValueError("limit must be at least 1")
        return tuple(reversed(self._orders[-limit:]))

    def place_order(self, pod_id: str, sku: str, quantity: int = 1) -> Order:
        """Runtime command used by backend APIs; inventory and revenue change together."""
        if quantity < 1:
            raise ValueError("quantity must be at least 1")
        pod = self._pods.get(pod_id)
        if not pod:
            raise KeyError(f"Unknown pod: {pod_id}")
        item = pod.inventory.get(sku)
        if not item:
            raise KeyError(f"Unknown SKU: {sku}")
        if item.quantity < quantity:
            raise ValueError(f"Insufficient stock for {sku}")
        pod.inventory[sku] = InventoryItem(**{**item.__dict__, "quantity": item.quantity - quantity})
        customer = self._rng.choice(_CUSTOMER_NAMES)
        payment = self._rng.choice(_PAYMENT_METHODS)
        status = self._rng.choice(_STATUS_OPTIONS)
        order = Order(
            str(uuid.uuid4()), pod_id, self._now, ((sku, quantity),), 
            item.unit_price_inr * quantity, customer, status, payment
        )
        self._orders.append(order)
        self._revenue_inr += order.total_inr
        self._emit(EventType.ORDER_CREATED, pod_id, {"order_id": order.id, "total_inr": order.total_inr, "currency": "INR", "sku": sku})
        self._evaluate_alerts(pod)
        return order

    def replenish_inventory(self, pod_id: str, sku: str | None = None) -> PodSnapshot:
        """Refill pod inventory levels back to maximum capacity."""
        pod = self._pods.get(pod_id)
        if not pod:
            raise KeyError(f"Unknown pod: {pod_id}")
        if sku:
            item = pod.inventory.get(sku)
            if not item:
                sku = None
        
        if sku:
            pod.inventory[sku] = InventoryItem(**{**item.__dict__, "quantity": item.capacity})
            self._resolve_alert(pod_id, f"inventory:{sku}")
        else:
            for item_sku, item in list(pod.inventory.items()):
                pod.inventory[item_sku] = InventoryItem(**{**item.__dict__, "quantity": item.capacity})
                self._resolve_alert(pod_id, f"inventory:{item_sku}")
        
        self._evaluate_alerts(pod)
        return self._pod_snapshot(pod)

    def _maybe_generate_order(self, pod: _PodState) -> None:
        if pod.health.score < 35:
            return
        orders_this_minute = self._orders_per_hour // 60
        if self._rng.random() < (self._orders_per_hour % 60) / 60:
            orders_this_minute += 1
        for _ in range(orders_this_minute):
            available = [item for item in pod.inventory.values() if item.quantity > 0]
            if not available:
                return
            item = self._rng.choice(available)
            pod.inventory[item.sku] = InventoryItem(**{**item.__dict__, "quantity": item.quantity - 1})
            customer = self._rng.choice(_CUSTOMER_NAMES)
            payment = self._rng.choice(_PAYMENT_METHODS)
            status = self._rng.choice(_STATUS_OPTIONS)
            order = Order(
                str(uuid.uuid4()), pod.id, self._now, ((item.sku, 1),), 
                item.unit_price_inr, customer, status, payment
            )
            self._orders.append(order)
            self._revenue_inr += order.total_inr
            self._emit(EventType.ORDER_CREATED, pod.id, {"order_id": order.id, "total_inr": order.total_inr, "currency": "INR", "sku": item.sku})

    def _update_health(self, pod: _PodState) -> None:
        previous = pod.health
        temperature = min(55.0, max(2.0, previous.temperature_c + self._rng.uniform(-0.12, 0.12)))
        latency = min(2000.0, max(5.0, previous.network_latency_ms + self._rng.uniform(-4, 4)))
        score = max(0.0, min(100.0, 100 - self._profile_health_wear()
                             - max(0, temperature - 8) * 4 - max(0, latency - 150) / 8))
        pod.health = MachineHealth(score, temperature, previous.power_draw_w, latency,
                                   latency < 900, previous.door_locked)
        self._emit(EventType.HEALTH_UPDATED, pod.id, {"score": round(score, 2), "temperature_c": round(temperature, 2)})

    def _evaluate_alerts(self, pod: _PodState) -> None:
        for item in pod.inventory.values():
            code = f"inventory:{item.sku}"
            if item.quantity == 0:
                self._set_alert(pod.id, code, AlertSeverity.CRITICAL, f"{item.name} is out of stock", EventType.INVENTORY_DEPLETED)
            elif item.quantity <= item.reorder_point:
                self._set_alert(pod.id, code, AlertSeverity.WARNING, f"{item.name} is below reorder point", EventType.INVENTORY_LOW)
            else:
                self._resolve_alert(pod.id, code)
        self._set_health_alert(pod, "health:temperature", pod.health.temperature_c > 10, AlertSeverity.WARNING, "Temperature exceeds safe range")
        self._set_health_alert(pod, "health:network", pod.health.network_latency_ms > 500, AlertSeverity.WARNING, "Network latency is elevated")

    def _set_health_alert(self, pod: _PodState, code: str, condition: bool, severity: AlertSeverity, message: str) -> None:
        if condition: self._set_alert(pod.id, code, severity, message, EventType.ALERT_OPENED)
        else: self._resolve_alert(pod.id, code)

    def _set_alert(self, pod_id: str, code: str, severity: AlertSeverity, message: str, trigger: EventType) -> None:
        key = (pod_id, code)
        if key in self._alerts and self._alerts[key].active:
            return
        alert = Alert(str(uuid.uuid4()), pod_id, severity, code, message, self._now)
        self._alerts[key] = alert
        self._emit(trigger, pod_id, {"code": code, "severity": severity.value})
        self._emit(EventType.ALERT_OPENED, pod_id, {"alert_id": alert.id, "code": code, "severity": severity.value})

    def _seed_demo_alerts(self) -> None:
        pod = next(iter(self._pods.values()), None)
        if not pod:
            return
        self._set_alert(pod.id, "demo:milk-low", AlertSeverity.WARNING,
                        "Milk level below 25%. Recommended refill before 5:30 PM.",
                        EventType.ALERT_OPENED)
        self._set_alert(pod.id, "demo:preventive-maintenance", AlertSeverity.INFO,
                        "Preventive maintenance due in 120 cups.", EventType.ALERT_OPENED)

    def _profile_orders_per_hour(self) -> int:
        ranges = {
            SimulationProfile.MORNING: (15, 20),
            SimulationProfile.AFTERNOON: (30, 40),
            SimulationProfile.EVENING_RUSH: (60, 100),
        }
        low, high = ranges[self.config.profile]
        return self._rng.randint(low, high)

    def _profile_health_wear(self) -> float:
        return {
            SimulationProfile.MORNING: 1.0,
            SimulationProfile.AFTERNOON: 2.5,
            SimulationProfile.EVENING_RUSH: 4.5,
        }[self.config.profile]

    def _resolve_alert(self, pod_id: str, code: str) -> None:
        key = (pod_id, code)
        alert = self._alerts.get(key)
        if alert and alert.active:
            self._alerts[key] = Alert(**{**alert.__dict__, "active": False})
            self._emit(EventType.ALERT_RESOLVED, pod_id, {"alert_id": alert.id, "code": code})

    def _emit(self, event_type: EventType, pod_id: str, payload: dict) -> None:
        event = RuntimeEvent(event_type, self._now, pod_id, payload)
        for listener in tuple(self._listeners): listener(event)

    @staticmethod
    def _load_pods(pods: Iterable[PodSnapshot]) -> dict[str, _PodState]:
        return {p.id: _PodState(p.id, p.name, {i.sku: i for i in p.inventory}, p.health) for p in pods}

    @staticmethod
    def _pod_snapshot(pod: _PodState) -> PodSnapshot:
        status = PodStatus.OPERATIONAL if pod.health.score >= 70 else PodStatus.DEGRADED if pod.health.score >= 35 else PodStatus.OFFLINE
        return PodSnapshot(pod.id, pod.name, status, tuple(pod.inventory.values()), pod.health)

    @staticmethod
    def _default_pods() -> tuple[PodSnapshot, ...]:
        inventory = (
            InventoryItem("milk", "Whole Milk", 120, 80, 100, 20),
            InventoryItem("water", "Spring Water", 40, 80, 96, 20),
            InventoryItem("cold-brew", "Cold Brew", 180, 80, 100, 15),
            InventoryItem("protein-bar", "Protein Bar", 95, 80, 100, 15),
        )
        health = MachineHealth(98, 5.5, 320, 45, True, True)
        return (PodSnapshot("pod-001", "NexPod Atrium", PodStatus.OPERATIONAL, inventory, health),)
