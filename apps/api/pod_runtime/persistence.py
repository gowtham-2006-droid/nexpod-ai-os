"""PostgreSQL projection for the authoritative in-memory Pod Runtime.

This module intentionally never computes or mutates operational state. The engine
owns state; this repository records serializable snapshots after each state change.
"""
from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime
from typing import Protocol

from .models import RuntimeSnapshot


class RuntimeSnapshotRepository(Protocol):
    def save_snapshot(self, snapshot: RuntimeSnapshot) -> None: ...


def snapshot_document(snapshot: RuntimeSnapshot) -> dict:
    """Create a JSON-safe document without leaking mutable runtime objects."""
    return json.loads(json.dumps(asdict(snapshot), default=_json_default))


def _json_default(value: object) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return getattr(value, "value", str(value))


class SupabasePostgresRepository:
    """Persistence adapter using Supabase's standard PostgreSQL connection URL.

    Install ``psycopg[binary]`` and set ``SUPABASE_DB_URL`` to the Supabase
    Postgres connection string. Apply ``supabase/migrations/001_runtime.sql``
    before starting the API.
    """

    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    def save_snapshot(self, snapshot: RuntimeSnapshot) -> None:
        try:
            import psycopg
        except ImportError as exc:  # pragma: no cover - environment guard
            raise RuntimeError("Install psycopg[binary] to enable Supabase persistence") from exc

        document = snapshot_document(snapshot)
        with psycopg.connect(self.database_url) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """insert into runtime_snapshots (simulated_at, payload)
                       values (%s, %s::jsonb) returning id""",
                    (snapshot.simulated_at, json.dumps(document)),
                )
                snapshot_id = cursor.fetchone()[0]
                self._upsert_current_state(cursor, snapshot, snapshot_id)
            connection.commit()

    @staticmethod
    def _upsert_current_state(cursor, snapshot: RuntimeSnapshot, snapshot_id: int) -> None:
        for pod in snapshot.pods:
            cursor.execute(
                """insert into pod_state (pod_id, name, status, health, updated_at, snapshot_id)
                   values (%s, %s, %s, %s::jsonb, %s, %s)
                   on conflict (pod_id) do update set name = excluded.name, status = excluded.status,
                   health = excluded.health, updated_at = excluded.updated_at, snapshot_id = excluded.snapshot_id""",
                (pod.id, pod.name, pod.status.value, json.dumps(asdict(pod.health), default=_json_default),
                 snapshot.simulated_at, snapshot_id),
            )
            for item in pod.inventory:
                cursor.execute(
                    """insert into inventory_state (pod_id, sku, name, unit_price_inr, quantity, capacity,
                       reorder_point, updated_at, snapshot_id) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                       on conflict (pod_id, sku) do update set name = excluded.name,
                       unit_price_inr = excluded.unit_price_inr, quantity = excluded.quantity,
                       capacity = excluded.capacity, reorder_point = excluded.reorder_point,
                       updated_at = excluded.updated_at, snapshot_id = excluded.snapshot_id""",
                    (pod.id, item.sku, item.name, item.unit_price_inr, item.quantity, item.capacity,
                     item.reorder_point, snapshot.simulated_at, snapshot_id),
                )
        for order in snapshot.recent_orders:
            cursor.execute(
                """insert into runtime_orders (order_id, pod_id, created_at, lines, total_inr, snapshot_id)
                   values (%s,%s,%s,%s::jsonb,%s,%s) on conflict (order_id) do nothing""",
                (order.id, order.pod_id, order.created_at, json.dumps(order.lines), order.total_inr, snapshot_id),
            )
        for alert in snapshot.alerts:
            cursor.execute(
                """insert into active_alerts (alert_id, pod_id, severity, code, message, opened_at, active, snapshot_id)
                   values (%s,%s,%s,%s,%s,%s,%s,%s)
                   on conflict (alert_id) do update set active = excluded.active, snapshot_id = excluded.snapshot_id""",
                (alert.id, alert.pod_id, alert.severity.value, alert.code, alert.message,
                 alert.opened_at, alert.active, snapshot_id),
            )
