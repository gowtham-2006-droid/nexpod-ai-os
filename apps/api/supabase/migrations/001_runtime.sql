create table if not exists runtime_snapshots (
  id bigint generated always as identity primary key,
  simulated_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  payload jsonb not null
);

create table if not exists pod_state (
  pod_id text primary key,
  name text not null,
  status text not null,
  health jsonb not null,
  updated_at timestamptz not null,
  snapshot_id bigint not null references runtime_snapshots(id)
);

create table if not exists inventory_state (
  pod_id text not null references pod_state(pod_id),
  sku text not null,
  name text not null,
  unit_price_inr integer not null check (unit_price_inr >= 0),
  quantity integer not null check (quantity >= 0),
  capacity integer not null check (capacity >= 0),
  reorder_point integer not null check (reorder_point >= 0),
  updated_at timestamptz not null,
  snapshot_id bigint not null references runtime_snapshots(id),
  primary key (pod_id, sku)
);

create table if not exists runtime_orders (
  order_id uuid primary key,
  pod_id text not null,
  created_at timestamptz not null,
  lines jsonb not null,
  total_inr integer not null check (total_inr >= 0),
  snapshot_id bigint not null references runtime_snapshots(id)
);

create table if not exists active_alerts (
  alert_id uuid primary key,
  pod_id text not null,
  severity text not null,
  code text not null,
  message text not null,
  opened_at timestamptz not null,
  active boolean not null,
  snapshot_id bigint not null references runtime_snapshots(id)
);

create index if not exists runtime_snapshots_simulated_at_idx on runtime_snapshots (simulated_at desc);
create index if not exists runtime_orders_pod_created_idx on runtime_orders (pod_id, created_at desc);
create index if not exists active_alerts_pod_active_idx on active_alerts (pod_id, active);
