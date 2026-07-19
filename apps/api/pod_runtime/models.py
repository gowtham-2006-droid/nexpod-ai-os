from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any


class PodStatus(str, Enum):
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    OFFLINE = "offline"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class EventType(str, Enum):
    ORDER_CREATED = "order.created"
    INVENTORY_LOW = "inventory.low"
    INVENTORY_DEPLETED = "inventory.depleted"
    HEALTH_UPDATED = "health.updated"
    ALERT_OPENED = "alert.opened"
    ALERT_RESOLVED = "alert.resolved"


class SimulationProfile(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING_RUSH = "evening_rush"


@dataclass(frozen=True)
class InventoryItem:
    sku: str
    name: str
    unit_price_inr: int
    quantity: int
    capacity: int
    reorder_point: int


@dataclass(frozen=True)
class MachineHealth:
    score: float
    temperature_c: float
    power_draw_w: float
    network_latency_ms: float
    payment_terminal_ok: bool
    door_locked: bool


@dataclass(frozen=True)
class PodSnapshot:
    id: str
    name: str
    status: PodStatus
    inventory: tuple[InventoryItem, ...]
    health: MachineHealth


@dataclass(frozen=True)
class Order:
    id: str
    pod_id: str
    created_at: datetime
    lines: tuple[tuple[str, int], ...]
    total_inr: int
    customer: str = "Atrium Customer"
    status: str = "completed"
    payment_method: str = "UPI"


@dataclass(frozen=True)
class Alert:
    id: str
    pod_id: str
    severity: AlertSeverity
    code: str
    message: str
    opened_at: datetime
    active: bool = True


@dataclass(frozen=True)
class RevenueMetrics:
    currency: str
    gross_revenue_inr: int
    order_count: int
    average_order_value_inr: int


@dataclass(frozen=True)
class RuntimeSnapshot:
    simulated_at: datetime
    pods: tuple[PodSnapshot, ...]
    metrics: RevenueMetrics
    alerts: tuple[Alert, ...]
    recent_orders: tuple[Order, ...]


@dataclass(frozen=True)
class RuntimeEvent:
    type: EventType
    occurred_at: datetime
    pod_id: str
    payload: dict[str, Any]
