"""
Tests for NexPod Incident Replay Engine (incident_service.py)
"""

from __future__ import annotations

import pytest
from backend.app.services.incident_service import (
    IncidentReplayService,
    MAX_INCIDENT_EVENTS,
)


def test_initial_seed_history_populated():
    service = IncidentReplayService()
    data = service.get_incidents()
    assert "generated_at" in data
    assert "events" in data
    events = data["events"]
    assert len(events) >= 6
    # Verify chronological order
    timestamps = [e["timestamp"] for e in events]
    assert timestamps == sorted(timestamps)


def test_record_event_buffers_correctly():
    service = IncidentReplayService()
    initial_count = len(service.get_incidents()["events"])

    evt = service.record_event(
        event_type="telemetry",
        title="Test Sensor Event",
        description="Testing sensor anomaly recording",
        severity="warning",
    )

    data = service.get_incidents()
    assert len(data["events"]) == initial_count + 1
    assert data["events"][-1]["id"] == evt.id
    assert data["events"][-1]["title"] == "Test Sensor Event"


def test_circular_buffer_eviction():
    service = IncidentReplayService()
    # Fill past max capacity
    for i in range(MAX_INCIDENT_EVENTS + 50):
        service.record_event(
            event_type="order",
            title=f"Order Event {i}",
            description=f"Description {i}",
        )

    data = service.get_incidents()
    assert len(data["events"]) <= MAX_INCIDENT_EVENTS
