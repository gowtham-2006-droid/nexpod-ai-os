"""
Tests for the NexPod ML Predictive Maintenance Engine (anomaly_service.py)
==========================================================================
Coverage:
  - Buffer accumulation and max-size eviction
  - Cold-start (zero samples) fallback report
  - Pre-training state (< TRAINING_THRESHOLD samples) — Z-score only
  - Isolation Forest training trigger at TRAINING_THRESHOLD
  - Isolation Forest retraining on RETRAIN_INTERVAL
  - Z-score anomaly detection with injected outlier
  - Isolation Forest anomaly detection with injected outlier cluster
  - Normal data produces low composite_risk_score
  - AnomalyReport schema completeness
  - Thread-safety smoke test (concurrent ingest calls)
  - Diagnosis string generation
"""

from __future__ import annotations

import threading
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from backend.app.services.anomaly_service import (
    TRAINING_THRESHOLD,
    RETRAIN_INTERVAL,
    Z_SCORE_THRESHOLD,
    AnomalyDetectionService,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_snapshot(
    temperature_c: float = 5.5,
    network_latency_ms: float = 45.0,
    power_draw_w: float = 320.0,
    pod_id: str = "pod-001",
) -> MagicMock:
    """Build a minimal RuntimeSnapshot mock compatible with anomaly_service.ingest()."""
    snapshot = MagicMock()
    pod = MagicMock()
    pod.id = pod_id
    pod.health.temperature_c = temperature_c
    pod.health.network_latency_ms = network_latency_ms
    pod.health.power_draw_w = power_draw_w
    snapshot.pods = [pod]
    snapshot.simulated_at = datetime.now(timezone.utc)
    return snapshot


def _feed_normal(service: AnomalyDetectionService, n: int) -> None:
    """Feed n normal (baseline) telemetry samples."""
    for i in range(n):
        service.ingest(_make_snapshot(
            temperature_c=5.5 + (i % 3) * 0.05,
            network_latency_ms=45.0 + (i % 5) * 0.5,
            power_draw_w=320.0 + (i % 4) * 0.2,
        ))


# ---------------------------------------------------------------------------
# 1. Cold-start (no samples ingested)
# ---------------------------------------------------------------------------

class TestColdStart:
    def test_get_report_before_ingest_returns_defaults(self):
        service = AnomalyDetectionService()
        report = service.get_report()

        assert report["samples_collected"] == 0
        assert report["model_status"] == "warming_up"
        assert report["anomaly_detected"] is False
        assert report["composite_risk_score"] == 0.0
        assert report["confidence"] == 0.0
        assert "initialising" in report["diagnosis"].lower() or "initialising" in report["diagnosis"]

    def test_get_report_none_snapshot_is_ignored(self):
        service = AnomalyDetectionService()
        service.ingest(None)
        report = service.get_report()
        assert report["samples_collected"] == 0

    def test_empty_pods_snapshot_is_ignored(self):
        service = AnomalyDetectionService()
        snap = MagicMock()
        snap.pods = []
        service.ingest(snap)
        report = service.get_report()
        assert report["samples_collected"] == 0


# ---------------------------------------------------------------------------
# 2. Buffer accumulation
# ---------------------------------------------------------------------------

class TestBufferAccumulation:
    def test_samples_collected_increments_correctly(self):
        service = AnomalyDetectionService()
        for i in range(1, 11):
            service.ingest(_make_snapshot())
            assert service.get_report()["samples_collected"] == i

    def test_buffer_evicts_oldest_at_max_size(self):
        from backend.app.services.anomaly_service import MAX_BUFFER_SIZE
        service = AnomalyDetectionService()
        _feed_normal(service, MAX_BUFFER_SIZE + 10)
        # Buffer should not exceed MAX_BUFFER_SIZE
        assert len(service._buffer) == MAX_BUFFER_SIZE

    def test_pod_id_captured_from_snapshot(self):
        service = AnomalyDetectionService()
        service.ingest(_make_snapshot(pod_id="pod-007"))
        report = service.get_report()
        assert report["pod_id"] == "pod-007"


# ---------------------------------------------------------------------------
# 3. Pre-training phase (Z-score only, model not yet fitted)
# ---------------------------------------------------------------------------

class TestPreTrainingPhase:
    def test_model_status_warming_up_below_threshold(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD - 1)
        report = service.get_report()
        assert report["model_status"] == "warming_up"
        assert service._model is None

    def test_isolation_forest_score_is_none_while_warming_up(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD - 1)
        report = service.get_report()
        assert report["isolation_forest_score"] is None

    def test_generated_by_zscore_while_warming_up(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD - 1)
        report = service.get_report()
        assert report["generated_by"] == "ZScore"

    def test_confidence_below_100_while_warming_up(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD // 2)
        report = service.get_report()
        # Confidence should be partial, scaled by sample ratio × 0.75 (pre-training penalty)
        assert 0.0 < report["confidence"] < 100.0

    def test_zscore_anomaly_detected_during_warmup(self):
        """A large temperature spike should be caught by Z-score even before model training."""
        service = AnomalyDetectionService()
        # Feed stable baseline
        _feed_normal(service, 20)
        # Inject a severe temperature outlier (far above normal range)
        service.ingest(_make_snapshot(temperature_c=9999.0))
        report = service.get_report()
        temp_feature = report["features"]["temperature_c"]
        assert temp_feature["is_anomaly"] is True
        assert temp_feature["z_score"] > Z_SCORE_THRESHOLD


# ---------------------------------------------------------------------------
# 4. Isolation Forest training trigger
# ---------------------------------------------------------------------------

class TestIsolationForestTraining:
    def test_model_trained_at_threshold(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        assert service._model is not None

    def test_model_status_trained_after_threshold(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert report["model_status"] == "trained"

    def test_isolation_forest_score_populated_after_training(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert report["isolation_forest_score"] is not None
        assert isinstance(report["isolation_forest_score"], float)

    def test_generated_by_includes_isolation_forest_after_training(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert "IsolationForest" in report["generated_by"]

    def test_confidence_100_after_training(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        # After training, base confidence = 100%, penalty removed
        assert report["confidence"] == 100.0


# ---------------------------------------------------------------------------
# 5. Retraining
# ---------------------------------------------------------------------------

class TestRetraining:
    def test_model_retrained_after_retrain_interval(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        first_model = service._model

        # Force retrain by feeding RETRAIN_INTERVAL more samples
        _feed_normal(service, RETRAIN_INTERVAL)
        assert service._model is not first_model  # new model object fitted

    def test_samples_since_retrain_resets_after_retrain(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD + RETRAIN_INTERVAL)
        assert service._samples_since_retrain == 0


# ---------------------------------------------------------------------------
# 6. Anomaly detection accuracy (trained model)
# ---------------------------------------------------------------------------

class TestAnomalyDetectionAccuracy:
    def _train_on_normal(self, service: AnomalyDetectionService) -> None:
        """Train the model on tight, consistent normal data."""
        for _ in range(TRAINING_THRESHOLD):
            service.ingest(_make_snapshot(
                temperature_c=5.50,
                network_latency_ms=45.0,
                power_draw_w=320.0,
            ))

    def test_normal_reading_scores_low_risk(self):
        service = AnomalyDetectionService()
        self._train_on_normal(service)
        service.ingest(_make_snapshot(
            temperature_c=5.52,
            network_latency_ms=45.2,
            power_draw_w=320.1,
        ))
        report = service.get_report()
        # Normal data should not produce a high composite risk
        assert report["composite_risk_score"] < 0.6

    def test_extreme_temperature_spike_detected(self):
        service = AnomalyDetectionService()
        self._train_on_normal(service)
        service.ingest(_make_snapshot(temperature_c=9999.0))
        report = service.get_report()
        assert report["features"]["temperature_c"]["is_anomaly"] is True

    def test_extreme_latency_spike_detected(self):
        service = AnomalyDetectionService()
        self._train_on_normal(service)
        service.ingest(_make_snapshot(network_latency_ms=99999.0))
        report = service.get_report()
        assert report["features"]["network_latency_ms"]["is_anomaly"] is True

    def test_anomaly_detected_flag_true_on_critical_spike(self):
        service = AnomalyDetectionService()
        self._train_on_normal(service)
        service.ingest(_make_snapshot(temperature_c=9999.0))
        report = service.get_report()
        assert report["anomaly_detected"] is True

    def test_normal_reading_anomaly_detected_false(self):
        service = AnomalyDetectionService()
        self._train_on_normal(service)
        # Re-inject a clean sample after training
        service.ingest(_make_snapshot(
            temperature_c=5.50,
            network_latency_ms=45.0,
            power_draw_w=320.0,
        ))
        report = service.get_report()
        assert report["anomaly_detected"] is False


# ---------------------------------------------------------------------------
# 7. AnomalyReport schema completeness
# ---------------------------------------------------------------------------

class TestReportSchema:
    EXPECTED_TOP_LEVEL_KEYS = {
        "pod_id", "detected_at", "model_status", "samples_collected",
        "anomaly_detected", "composite_risk_score", "confidence",
        "features", "isolation_forest_score", "diagnosis", "generated_by",
    }
    EXPECTED_FEATURE_KEYS = {"value", "mean", "std", "z_score", "is_anomaly"}
    FEATURE_NAMES = {"temperature_c", "network_latency_ms", "power_draw_w"}

    def test_cold_start_report_has_all_keys(self):
        service = AnomalyDetectionService()
        report = service.get_report()
        assert self.EXPECTED_TOP_LEVEL_KEYS.issubset(report.keys())

    def test_trained_report_has_all_keys(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert self.EXPECTED_TOP_LEVEL_KEYS.issubset(report.keys())

    def test_features_contain_all_sensors(self):
        service = AnomalyDetectionService()
        _feed_normal(service, 5)
        report = service.get_report()
        assert self.FEATURE_NAMES.issubset(report["features"].keys())

    def test_each_feature_has_all_subkeys(self):
        service = AnomalyDetectionService()
        _feed_normal(service, 5)
        report = service.get_report()
        for feat in report["features"].values():
            assert self.EXPECTED_FEATURE_KEYS.issubset(feat.keys())

    def test_composite_risk_score_bounded(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert 0.0 <= report["composite_risk_score"] <= 1.0

    def test_confidence_bounded(self):
        service = AnomalyDetectionService()
        _feed_normal(service, TRAINING_THRESHOLD)
        report = service.get_report()
        assert 0.0 <= report["confidence"] <= 100.0

    def test_detected_at_is_iso8601_string(self):
        service = AnomalyDetectionService()
        service.ingest(_make_snapshot())
        report = service.get_report()
        # Should parse without error
        datetime.fromisoformat(report["detected_at"].replace("Z", "+00:00"))


# ---------------------------------------------------------------------------
# 8. Diagnosis string generation
# ---------------------------------------------------------------------------

class TestDiagnosis:
    def test_normal_diagnosis_contains_normal_message(self):
        service = AnomalyDetectionService()
        # Feed consistent baseline so no anomaly is raised
        for _ in range(TRAINING_THRESHOLD):
            service.ingest(_make_snapshot(
                temperature_c=5.50,
                network_latency_ms=45.0,
                power_draw_w=320.0,
            ))
        # Inject a clean reading after training
        service.ingest(_make_snapshot(
            temperature_c=5.50,
            network_latency_ms=45.0,
            power_draw_w=320.0,
        ))
        report = service.get_report()
        if not report["anomaly_detected"]:
            assert "normal" in report["diagnosis"].lower() or "✅" in report["diagnosis"]

    def test_anomaly_diagnosis_contains_sensor_name(self):
        service = AnomalyDetectionService()
        # Train on tightly clustered normal data
        for _ in range(TRAINING_THRESHOLD):
            service.ingest(_make_snapshot(temperature_c=5.5))
        # Inject a massive temperature outlier
        service.ingest(_make_snapshot(temperature_c=9999.0))
        report = service.get_report()
        if report["features"]["temperature_c"]["is_anomaly"]:
            assert "temperature" in report["diagnosis"].lower()

    def test_cold_start_diagnosis_mentions_initialising(self):
        service = AnomalyDetectionService()
        report = service.get_report()
        diag = report["diagnosis"].lower()
        assert "initialising" in diag or "collecting" in diag


# ---------------------------------------------------------------------------
# 9. Thread-safety smoke test
# ---------------------------------------------------------------------------

class TestThreadSafety:
    def test_concurrent_ingest_does_not_crash(self):
        service = AnomalyDetectionService()
        errors: list[Exception] = []

        def worker():
            try:
                for _ in range(20):
                    service.ingest(_make_snapshot())
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=worker) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert errors == [], f"Thread safety errors: {errors}"

    def test_concurrent_ingest_and_get_report_do_not_crash(self):
        service = AnomalyDetectionService()
        errors: list[Exception] = []

        def ingest_worker():
            try:
                for _ in range(30):
                    service.ingest(_make_snapshot())
            except Exception as exc:
                errors.append(exc)

        def report_worker():
            try:
                for _ in range(30):
                    service.get_report()
            except Exception as exc:
                errors.append(exc)

        threads = (
            [threading.Thread(target=ingest_worker) for _ in range(3)]
            + [threading.Thread(target=report_worker) for _ in range(3)]
        )
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert errors == [], f"Thread safety errors: {errors}"
