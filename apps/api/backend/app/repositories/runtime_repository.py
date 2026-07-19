from dataclasses import asdict
from sqlalchemy.orm import Session
from ..models.entities import AlertRecord, AIInsightRecord, InventoryRecord, MachineHealthRecord, OrderRecord, Pod, TelemetryRecord


class RuntimeRepository:
    """Durable projection only. It never makes operational decisions."""
    def __init__(self, session: Session): self.session = session

    def save(self, snapshot, insight: dict) -> None:
        for pod in snapshot.pods:
            self.session.merge(Pod(id=pod.id, name=pod.name, status=pod.status.value, updated_at=snapshot.simulated_at))
            for item in pod.inventory:
                self.session.merge(InventoryRecord(pod_id=pod.id, sku=item.sku, name=item.name, quantity=item.quantity, capacity=item.capacity, reorder_point=item.reorder_point, unit_price_inr=item.unit_price_inr))
            self.session.add(MachineHealthRecord(pod_id=pod.id, recorded_at=snapshot.simulated_at, score=pod.health.score, payload=asdict(pod.health)))
            self.session.add(TelemetryRecord(pod_id=pod.id, recorded_at=snapshot.simulated_at, payload={"temperature_c": pod.health.temperature_c, "power_draw_w": pod.health.power_draw_w, "network_latency_ms": pod.health.network_latency_ms}))
        for order in snapshot.recent_orders:
            if not self.session.get(OrderRecord, order.id):
                self.session.add(OrderRecord(id=order.id, pod_id=order.pod_id, created_at=order.created_at, total_inr=order.total_inr, lines={"items": [{"sku": sku, "quantity": qty} for sku, qty in order.lines]}))
        for alert in snapshot.alerts:
            self.session.merge(AlertRecord(id=alert.id, pod_id=alert.pod_id, severity=alert.severity.value, code=alert.code, message=alert.message, active=alert.active, opened_at=alert.opened_at))
        for pod in snapshot.pods:
            self.session.add(AIInsightRecord(pod_id=pod.id, generated_at=snapshot.simulated_at, payload=insight))
        self.session.commit()
