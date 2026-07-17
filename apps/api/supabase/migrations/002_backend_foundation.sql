create table if not exists users (id text primary key, email text not null unique, role text not null default 'owner');
create table if not exists pods (id text primary key, name text not null, status text not null, updated_at timestamptz not null);
create table if not exists orders (id text primary key, pod_id text not null references pods(id), created_at timestamptz not null, total_inr integer not null, lines jsonb not null);
create table if not exists inventory (pod_id text not null references pods(id), sku text not null, name text not null, quantity integer not null, capacity integer not null, reorder_point integer not null, unit_price_inr integer not null, primary key (pod_id, sku));
create table if not exists machine_health (id bigint generated always as identity primary key, pod_id text not null references pods(id), recorded_at timestamptz not null, score double precision not null, payload jsonb not null);
create table if not exists telemetry (id bigint generated always as identity primary key, pod_id text not null references pods(id), recorded_at timestamptz not null, payload jsonb not null);
create table if not exists alerts (id text primary key, pod_id text not null references pods(id), severity text not null, code text not null, message text not null, active boolean not null, opened_at timestamptz not null);
create table if not exists ai_insights (id bigint generated always as identity primary key, pod_id text not null references pods(id), generated_at timestamptz not null, payload jsonb not null);
create index if not exists telemetry_pod_recorded_idx on telemetry (pod_id, recorded_at desc);
