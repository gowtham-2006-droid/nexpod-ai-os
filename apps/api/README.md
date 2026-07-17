# NexPod Runtime Engine

Headless simulation runtime for autonomous vending / retail pods. It generates orders, decrements inventory, recognizes INR revenue, tracks machine health, and publishes immutable snapshots and domain events for a future dashboard. Evening Rush is the default profile for a visibly active demo.

## Run

```powershell
py -m unittest discover -s tests -v
py demo.py
```

## Supabase + REST API

1. Create a Supabase project and run [the migration](supabase/migrations/001_runtime.sql) in its SQL editor (or through the Supabase CLI).
2. Copy `.env.example` to `.env` and provide `SUPABASE_DB_URL` using the Supabase PostgreSQL connection string. Do not expose this value to browser code.
3. Install dependencies and start the API:

```powershell
py -m pip install -r requirements.txt
$env:SUPABASE_DB_URL = "postgresql://..."
py -m uvicorn backend.app.main:app --reload
```

The runtime remains the source of truth. Each `POST /api/v1/simulation/tick` advances it and writes one durable snapshot transaction to PostgreSQL. Read endpoints always query the current runtime state, not a potentially stale database projection.

Endpoints: `GET /api/v1/dashboard`, `GET /api/v1/orders`, `GET /api/v1/pods/{pod_id}/inventory`, `GET /api/v1/pods/{pod_id}/machine-health`, `GET /api/v1/alerts`, `GET /api/v1/ai-context`, and `POST /api/v1/simulation/tick`.

## Dashboard contract

Create an engine, subscribe to events, call `tick()`, and consume `get_snapshot()`.

```python
from pod_runtime import PodRuntimeEngine, SimulationConfig

engine = PodRuntimeEngine(config=SimulationConfig(seed=42))  # Evening Rush + demo alerts
unsubscribe = engine.subscribe(lambda event: print(event.type, event.payload))
engine.tick(minutes=5)
snapshot = engine.get_snapshot()
```

`RuntimeSnapshot` is immutable and contains pod status, inventory, machine-health, revenue (in INR minor units), active alerts, and recent orders. `RuntimeEvent` provides a stable `type`, UTC timestamp, pod id, and JSON-safe payload.

Profiles: Morning (15–20 orders/hour), Afternoon (30–40), and Evening Rush (60–100). Demo mode intentionally opens two non-critical alerts so a dashboard can demonstrate alert handling.
