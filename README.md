# NexPod AI OS

Monorepo for the NexPod AI OS dashboard and autonomous pod runtime.

## Repository layout

```text
apps/
  api/        Pod Runtime, FastAPI REST service, and Supabase migration
  web/        Dashboard application (owned by Antigravity)
packages/
  ui/         Shared UI components
  shared/     Cross-application contracts and constants
  config/     Shared tooling configuration
docs/         Architecture and product documentation
```

## Ownership and integration boundary

- **Codex** works only in `apps/api/`: the Pod Runtime, PostgreSQL projection, and REST APIs.
- **Antigravity** works only in `apps/web/`: dashboard UI using mock data until the API is connected.
- The dashboard must keep its data-access seam isolated, so mock imports can later become API calls without component rewrites.

The backend’s API documentation and Supabase setup are in [apps/api/README.md](apps/api/README.md). The system design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Git branches

- `main`: integration branch
- `codex/api`: backend and runtime work
- `antigravity/web`: frontend work
