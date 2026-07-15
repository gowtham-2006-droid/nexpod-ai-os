import unittest

from pod_runtime import EventType, PodRuntimeEngine, SimulationConfig, SimulationProfile


class RuntimeEngineTests(unittest.TestCase):
    def test_tick_generates_observable_operations(self):
        engine = PodRuntimeEngine(config=SimulationConfig(seed=1, orders_per_hour=60, demo_mode=False))
        events = []
        engine.subscribe(events.append)
        snapshot = engine.tick(5)
        self.assertGreater(snapshot.metrics.order_count, 0)
        self.assertEqual(snapshot.metrics.order_count, len(snapshot.recent_orders))
        self.assertTrue(any(e.type == EventType.ORDER_CREATED for e in events))

    def test_snapshot_is_immutable_and_inventory_decreases(self):
        engine = PodRuntimeEngine(config=SimulationConfig(seed=2, orders_per_hour=60, demo_mode=False))
        before = engine.get_snapshot().pods[0].inventory
        after = engine.tick(2).pods[0].inventory
        self.assertLess(sum(i.quantity for i in after), sum(i.quantity for i in before))
        with self.assertRaises(Exception):
            engine.get_snapshot().metrics.gross_revenue_inr = 3

    def test_rejects_invalid_tick_duration(self):
        with self.assertRaises(ValueError):
            PodRuntimeEngine().tick(0)

    def test_evening_rush_uses_inr_and_demo_alerts(self):
        engine = PodRuntimeEngine(config=SimulationConfig(seed=7, profile=SimulationProfile.EVENING_RUSH))
        snapshot = engine.tick(60)
        self.assertGreaterEqual(snapshot.metrics.order_count, 60)
        self.assertEqual("INR", snapshot.metrics.currency)
        self.assertGreater(snapshot.metrics.gross_revenue_inr, 0)
        self.assertEqual(2, len(snapshot.alerts))
        self.assertLessEqual(snapshot.pods[0].health.score, 96)
        self.assertGreaterEqual(snapshot.pods[0].health.score, 95)


if __name__ == "__main__":
    unittest.main()
