"""
NexPod AI OS — Predictive Maintenance Engine
============================================
Real ML-based anomaly detection for autonomous pod telemetry.

Architecture
------------
- **Phase 1 (Warming Up):** Z-score rolling window on each feature individually.
  Active from tick 1 — no training required.
- **Phase 2 (Trained):** scikit-learn Isolation Forest trained on the full
  feature matrix once TRAINING_THRESHOLD samples are collected.
  Retrains automatically every RETRAIN_INTERVAL new samples.

Both signals are combined into a composite risk score [0.0 – 1.0].

Features monitored
------------------
- temperature_c       → thermal runaway / cooling fan fault
- network_latency_ms  → connectivity degradation / cellular drop
- power_draw_w        → power supply instability / motor surge

Public API
----------
    anomaly_service.ingest(snapshot)   # Called on every tick by main.py
    anomaly_service.get_report()       # Called by GET /api/anomaly
"""

from __future__ import annotations

import logging
import threading
from collections import deque
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Deque

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------

# Minimum samples before the Isolation Forest is trained for the first time.
TRAINING_THRESHOLD: int = 30

# Retrain the model every N new samples after initial training.
RETRAIN_INTERVAL: int = 20

# Maximum buffer length kept in memory. Oldest samples are evicted.
MAX_BUFFER_SIZE: int = 500

# Z-score threshold above which a single feature is flagged as anomalous.
Z_SCORE_THRESHOLD: float = 2.5

# Isolation Forest contamination estimate (expected fraction of outliers).
IF_CONTAMINATION: float = 0.08

# Isolation Forest random seed for reproducible training.
IF_RANDOM_STATE: int = 42


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class FeatureState:
    """Per-feature telemetry statistics and anomaly flags."""
    value: float
    mean: float
    std: float
    z_score: float
    is_anomaly: bool


@dataclass
class AnomalyReport:
    """
    Structured output of the predictive maintenance engine.
    Returned verbatim from GET /api/anomaly.
    """
    pod_id: str
    detected_at: str                      # ISO-8601 UTC timestamp
    model_status: str                     # "warming_up" | "trained"
    samples_collected: int
    anomaly_detected: bool
    composite_risk_score: float           # 0.0 (normal) → 1.0 (severe)
    confidence: float                     # 0.0 – 100.0 percentage
    features: dict[str, dict]             # FeatureState per feature name
    isolation_forest_score: float | None  # Raw IF decision function score
    diagnosis: str                        # Human-readable summary
    generated_by: str                     # "IsolationForest+ZScore" | "ZScore"


# ---------------------------------------------------------------------------
# Internal telemetry sample
# ---------------------------------------------------------------------------

@dataclass
class _TelemetrySample:
    pod_id: str
    recorded_at: datetime
    temperature_c: float
    network_latency_ms: float
    power_draw_w: float


# ---------------------------------------------------------------------------
# ML Engine
# ---------------------------------------------------------------------------

class AnomalyDetectionService:
    """
    Predictive maintenance engine for NexPod pod telemetry.

    Thread-safe: ingest() and get_report() may be called from
    different threads (background tick loop vs. HTTP request handler).
    """

    FEATURE_NAMES: tuple[str, ...] = (
        "temperature_c",
        "network_latency_ms",
        "power_draw_w",
    )

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._buffer: Deque[_TelemetrySample] = deque(maxlen=MAX_BUFFER_SIZE)
        self._model = None          # sklearn IsolationForest instance
        self._model_trained_at: datetime | None = None
        self._samples_since_retrain: int = 0
        self._last_report: AnomalyReport | None = None
        self._pod_id: str = "pod-001"

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def ingest(self, snapshot) -> None:
        """
        Ingest a RuntimeSnapshot produced by the engine tick.
        Called on every simulation tick from main.py's tick_loop().
        """
        if not snapshot or not snapshot.pods:
            return

        pod = snapshot.pods[0]
        sample = _TelemetrySample(
            pod_id=pod.id,
            recorded_at=snapshot.simulated_at,
            temperature_c=pod.health.temperature_c,
            network_latency_ms=pod.health.network_latency_ms,
            power_draw_w=pod.health.power_draw_w,
        )

        with self._lock:
            self._pod_id = pod.id
            self._buffer.append(sample)
            self._samples_since_retrain += 1
            self._maybe_train()
            self._last_report = self._compute_report(sample)

    def get_report(self) -> dict:
        """
        Return the most recent AnomalyReport as a plain dict.
        If no data has been ingested yet, returns a sensible default.
        """
        with self._lock:
            if self._last_report is None:
                return self._cold_start_report()
            return asdict(self._last_report)

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def _maybe_train(self) -> None:
        """Train or retrain the Isolation Forest when threshold is met."""
        n = len(self._buffer)
        should_initial_train = (
            self._model is None and n >= TRAINING_THRESHOLD
        )
        should_retrain = (
            self._model is not None
            and self._samples_since_retrain >= RETRAIN_INTERVAL
        )

        if should_initial_train or should_retrain:
            self._train_model()
            self._samples_since_retrain = 0

    def _train_model(self) -> None:
        """Fit the Isolation Forest on the current buffer matrix."""
        try:
            from sklearn.ensemble import IsolationForest  # lazy import

            X = self._feature_matrix()
            if X.shape[0] < TRAINING_THRESHOLD:
                return

            model = IsolationForest(
                n_estimators=100,
                contamination=IF_CONTAMINATION,
                random_state=IF_RANDOM_STATE,
                n_jobs=1,
            )
            model.fit(X)
            self._model = model
            self._model_trained_at = datetime.now(timezone.utc)
            logger.info(
                "AnomalyService: Isolation Forest trained on %d samples.",
                X.shape[0],
            )
        except Exception:
            logger.exception("AnomalyService: Model training failed.")

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    def _compute_report(self, sample: _TelemetrySample) -> AnomalyReport:
        """Score the latest sample and build a full AnomalyReport."""
        X_full = self._feature_matrix()
        feature_states: dict[str, FeatureState] = {}
        any_z_anomaly = False

        for col_idx, name in enumerate(self.FEATURE_NAMES):
            col = X_full[:, col_idx]
            mean = float(np.mean(col))
            std = float(np.std(col)) if len(col) > 1 else 0.0
            value = getattr(sample, name)
            z = abs((value - mean) / std) if std > 1e-6 else 0.0
            is_anom = z >= Z_SCORE_THRESHOLD
            if is_anom:
                any_z_anomaly = True
            feature_states[name] = FeatureState(
                value=round(value, 3),
                mean=round(mean, 3),
                std=round(std, 3),
                z_score=round(z, 3),
                is_anomaly=is_anom,
            )

        # --- Isolation Forest score -----------------------------------
        if_score: float | None = None
        if_anomaly = False
        if self._model is not None:
            x_vec = np.array([[
                sample.temperature_c,
                sample.network_latency_ms,
                sample.power_draw_w,
            ]])
            raw = float(self._model.decision_function(x_vec)[0])
            if_score = round(raw, 4)
            # decision_function returns negative values for anomalies
            if_anomaly = self._model.predict(x_vec)[0] == -1

        # --- Composite risk score -------------------------------------
        # Blend Z-score signal (always available) with IF signal (when trained)
        max_z = max(
            (fs.z_score for fs in feature_states.values()), default=0.0
        )
        # Normalise Z-score to [0, 1] using a sigmoid-like cap at 5σ
        z_risk = min(max_z / 5.0, 1.0)

        if if_score is not None:
            # IF decision_function score: typically in [-0.5, 0.5]; more negative = more anomalous.
            # Map to [0, 1]: anomaly score = clip((-if_score + 0.5) / 1.0, 0, 1)
            if_risk = min(max((-if_score + 0.1) / 0.6, 0.0), 1.0)
            # Weight: 60% IF, 40% Z-score once the model is trained
            composite = round(0.6 * if_risk + 0.4 * z_risk, 4)
        else:
            composite = round(z_risk, 4)

        anomaly_detected = (composite >= 0.5) or (any_z_anomaly and if_anomaly)

        # --- Confidence ----------------------------------------------
        n = len(self._buffer)
        # Confidence grows with sample count and stabilises at TRAINING_THRESHOLD
        base_conf = min(n / TRAINING_THRESHOLD, 1.0) * 100.0
        # Penalise if model not yet trained
        confidence = round(base_conf if self._model is not None else base_conf * 0.75, 1)

        # --- Diagnosis -----------------------------------------------
        diagnosis = self._diagnose(feature_states, composite, anomaly_detected)

        return AnomalyReport(
            pod_id=self._pod_id,
            detected_at=datetime.now(timezone.utc).isoformat(),
            model_status="trained" if self._model is not None else "warming_up",
            samples_collected=n,
            anomaly_detected=anomaly_detected,
            composite_risk_score=composite,
            confidence=confidence,
            features={k: asdict(v) for k, v in feature_states.items()},
            isolation_forest_score=if_score,
            diagnosis=diagnosis,
            generated_by="IsolationForest+ZScore" if self._model is not None else "ZScore",
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _feature_matrix(self) -> np.ndarray:
        """Build an (N, 3) numpy matrix from the current buffer."""
        return np.array(
            [
                [s.temperature_c, s.network_latency_ms, s.power_draw_w]
                for s in self._buffer
            ],
            dtype=np.float64,
        )

    @staticmethod
    def _diagnose(
        features: dict[str, FeatureState],
        composite: float,
        anomaly_detected: bool,
    ) -> str:
        """Generate a human-readable diagnosis string."""
        if not anomaly_detected:
            return "✅ All telemetry signals within normal operating parameters."

        flagged = [
            (name, fs) for name, fs in features.items() if fs.is_anomaly
        ]
        if not flagged:
            return "⚠️ Multivariate anomaly pattern detected by Isolation Forest. Individual sensors appear normal but joint behaviour is unusual."

        parts = []
        labels = {
            "temperature_c": ("Temperature spike", "°C", "Possible cooling fan fault or ambient heat source."),
            "network_latency_ms": ("Network latency surge", "ms", "Possible cellular congestion or antenna fault."),
            "power_draw_w": ("Power draw anomaly", "W", "Possible motor surge or power supply instability."),
        }
        for name, fs in flagged:
            label, unit, reason = labels.get(name, (name, "", ""))
            parts.append(
                f"{label} detected: {fs.value}{unit} (z={fs.z_score:.1f}σ). {reason}"
            )

        severity = "🔴 CRITICAL" if composite >= 0.75 else "⚠️ WARNING"
        return f"{severity} — " + " | ".join(parts)

    @staticmethod
    def _cold_start_report() -> dict:
        """Fallback report returned before any telemetry has been ingested."""
        return {
            "pod_id": "pod-001",
            "detected_at": datetime.now(timezone.utc).isoformat(),
            "model_status": "warming_up",
            "samples_collected": 0,
            "anomaly_detected": False,
            "composite_risk_score": 0.0,
            "confidence": 0.0,
            "features": {},
            "isolation_forest_score": None,
            "diagnosis": "🔄 Predictive maintenance engine is initialising. Collecting baseline telemetry...",
            "generated_by": "ZScore",
        }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

anomaly_service = AnomalyDetectionService()
