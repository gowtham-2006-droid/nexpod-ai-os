import sys

from pod_runtime import PodRuntimeEngine, SimulationConfig, SimulationProfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

engine = PodRuntimeEngine(config=SimulationConfig(seed=7, profile=SimulationProfile.EVENING_RUSH, demo_mode=True))
engine.tick(minutes=60)
snapshot = engine.get_snapshot()

print(f"Orders: {snapshot.metrics.order_count}")
print(f"Revenue: ₹{snapshot.metrics.gross_revenue_inr:,}")
print(f"Active alerts: {len(snapshot.alerts)}")
for pod in snapshot.pods:
    print(f"{pod.name}: {pod.status.value}, health={pod.health.score:.1f}")
for alert in snapshot.alerts:
    print(f"{alert.severity.value.upper()}: {alert.message}")
