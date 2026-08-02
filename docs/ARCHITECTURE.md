# NexPod Pod Runtime Architecture

## Purpose

The Pod Runtime Engine is a headless, in-memory simulation service for NexPod AI OS. It advances a fleet of autonomous pods through simulated time and exposes the resulting operational state for any later dashboard, API, scheduler, or automation layer. 

It deliberately contains no UI and no transport binding. A web dashboard can poll snapshots, while a WebSocket or message-bus adapter can forward runtime events without changing the simulation core.

## Architecture at a glance

```text
                         scheduler / test / worker
                                   |
                                   v
                           PodRuntimeEngine.tick()
                                   |
             +---------------------+----------------------+
             |                     |                      |
             v                     v                      v
       update machine         generate order        evaluate alerts
          health                and inventory       and resolve alerts
             |                     |                      |
             +---------------------+----------------------+
                                   |
                                   v
                    state store + RuntimeEvent stream
                              |               |
                              v               v
                    get_snapshot()       subscribe(listener)
                         |                     |
                         v                     v
                 dashboard/API adapter    WebSocket/event adapter
```

## Modules

| Module | Responsibility |
| --- | --- |
| `pod_runtime/models.py` | Immutable, typed contracts: pods, inventory, machine health, orders, alerts, metrics, snapshots, and events. |
| `pod_runtime/engine.py` | Simulation orchestration, private mutable state, revenue accounting, inventory mutation, health modelling, alert evaluation, and event publishing. |
| `pod_runtime/api.py` | FastAPI transport layer and dashboard, orders, inventory, health, alerts, and AI-context read models. |
| `pod_runtime/persistence.py` | Supabase PostgreSQL snapshot projection; it records runtime state but never determines it. |
| `supabase/migrations/001_runtime.sql` | PostgreSQL schema for snapshot history and current pod, inventory, order, and alert projections. |
| `pod_runtime/__init__.py` | Small public API surface for application consumers. |
| `demo.py` | Minimal executable example of advancing time and reading a snapshot. |
| `tests/test_engine.py` | Behavioral coverage for ticking, order events, stock changes, immutability, and invalid input. |

## Runtime responsibilities

### Simulation clock

`PodRuntimeEngine.tick(minutes)` is the only operation that changes simulation state. It advances one simulated minute at a time. This makes a one-hour simulation behave exactly like 60 one-minute simulation steps and keeps order/health transitions easy to test and reason about.

### Order generation and inventory

For each healthy pod and simulated minute, the engine uses a seeded pseudo-random generator to determine whether orders occur. An in-stock SKU is selected, one unit is removed, an `Order` is recorded, INR gross revenue is incremented, and an `order.created` event is published. No order is created when a pod is too unhealthy or all products are depleted.

Demand profiles make the demo visibly active: Morning produces 15–20 orders/hour, Afternoon 30–40, and Evening Rush 60–100. Evening Rush is the default; an explicit hourly rate can override it for tests or experiments.

### Machine health and pod state

Every tick updates temperature and network latency within bounded ranges. Health score is derived from these measurements and a profile load allowance rather than stored independently. Typical health is about 99% for light load, 97–98% for medium load, and 95–96% for Evening Rush. A pod status is computed from its health score:

| Health score | Pod status |
| --- | --- |
| 70–100 | `operational` |
| 35–69.99 | `degraded` |
| 0–34.99 | `offline` |

This avoids divergent state: consumers always see the same status for the same health reading.

### Alerts

The alert evaluator opens alerts when inventory reaches its reorder threshold or zero, temperature exceeds its safe limit, or latency becomes elevated. Alerts are keyed by `(pod_id, code)`, which prevents duplicates during successive ticks. When the condition clears, the existing alert is marked inactive and `alert.resolved` is emitted. Demo mode additionally opens two non-critical alerts: a milk refill recommendation and a preventive-maintenance reminder.

### Revenue metrics

The engine maintains gross revenue and an append-only order history. Monetary values are integer INR amounts, avoiding floating-point accounting errors. `RevenueMetrics` derives average order value from the order count, so reporting remains consistent with recognized orders.

## Public data contracts

### Snapshot interface

`get_snapshot()` returns a `RuntimeSnapshot` containing:

- `simulated_at`: current simulation timestamp (UTC)
- `pods`: per-pod identity, computed status, inventory, and health
- `metrics`: INR currency, gross revenue, order count, and average order value
- `alerts`: currently active alerts only
- `recent_orders`: bounded list of the most recent orders

All exported model objects are frozen dataclasses. Consumers cannot accidentally mutate engine state through a received snapshot.

### Event interface

`subscribe(listener)` registers a callback and returns an unsubscribe function. Event types are stable, string-valued enums:

- `order.created`
- `inventory.low`
- `inventory.depleted`
- `health.updated`
- `alert.opened`
- `alert.resolved`

Each `RuntimeEvent` includes the event type, UTC timestamp, pod ID, and a JSON-safe payload. The engine does not assume a delivery mechanism; an integration layer may forward these callbacks to WebSockets, HTTP streaming, Kafka, or a persisted event log.

## Data flow

1. A host process invokes `tick()` from a timer, background worker, or test.
2. The engine advances time, updates health for every pod, and emits `health.updated`.
3. A qualifying pod may create an order; inventory and revenue update atomically within the tick, then `order.created` is emitted.
4. Inventory and health rules evaluate alert conditions, opening or resolving alerts as necessary.
5. A dashboard adapter calls `get_snapshot()` for an immutable current view, or reacts to subscribed events for incremental updates.

## Supabase persistence and REST boundary

`RuntimeApplication` owns one `PodRuntimeEngine` and optionally a `SupabasePostgresRepository`. A simulation tick first completes in the runtime, then the resulting immutable snapshot is written in one PostgreSQL transaction to `runtime_snapshots` and its current-state projections. REST endpoints read from the runtime only; PostgreSQL is a durable projection for history, analytics, and operational recovery work, never a competing source of truth.

The API exposes `/api/v1/dashboard`, `/orders`, pod inventory and machine health, `/alerts`, and `/ai-context`. AI context is factual, structured operational state intended for a future model adapter; it does not call an AI model or invent recommendations.

## Design decisions

| Decision | Rationale |
| --- | --- |
| In-memory state | Keeps the runtime self-contained and ideal for prototypes, demos, deterministic tests, and local simulation. Persistence is intentionally an adapter concern. |
| Frozen public models | Prevents a consumer from altering data that it only intended to display. |
| Mutable private pod state | Lets the simulation evolve efficiently without leaking mutation through the public API. |
| Seedable randomness | A fixed `SimulationConfig.seed` makes simulations reproducible for debugging and tests. |
| Transport-neutral callbacks | Avoids coupling core operations to a UI framework, HTTP server, or message broker. |
| Derived pod status | Eliminates the risk of status and health score disagreeing. |
| Alert deduplication keys | One ongoing condition produces one active alert instead of alert spam on every tick. |

## Extension points

For production integration, keep the engine unchanged and add adapters around its contracts:

- A persistence adapter can write snapshots, orders, and events to a database.
- A scheduler adapter can invoke `tick()` at real-time intervals.
- An API adapter can serialize `RuntimeSnapshot` and expose it over REST.
- A streaming adapter can forward `RuntimeEvent` values to a WebSocket, broker, or notification service.
- Additional simulation policies can model restocking, demand by hour/location, payment failures, energy consumption, maintenance tasks, and predictive health.

## Boundaries

The current runtime is a simulator, not an authoritative transaction or device-control system. It does not persist state across restarts, process payments, authenticate users, communicate with physical machines, or guarantee delivery of callbacks. Those concerns should sit in infrastructure adapters when NexPod moves from simulated to live pod operations.
