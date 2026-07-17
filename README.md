# NexPod AI OS 🚀

A modern, AI-powered Operating System designed for monitoring, managing, and interacting with a fleet of autonomous, self-service retail pods (starting with automated coffee/tea brewing kiosks).

This repository is organized as a monorepo containing a high-performance Python backend (API, database, and AI engines) and a digital twin Web Frontend (operator dashboard and customer portal) with support for full dark/light themes, real-time telemetry simulation, and predictive maintenance dispatch.

---

## 📂 Repository Structure

```text
nexpod-ai-os/
├── apps/
│   ├── api/                      # Backend Service (FastAPI, Uvicorn, Supabase, AI/Gemini)
│   │   ├── backend/
│   │   │   └── app/              # FastAPI Application
│   │   │       ├── api/          # Route handlers & controllers
│   │   │       ├── core/         # Config & security settings
│   │   │       ├── database/     # Database connections & session management
│   │   │       ├── models/       # Database models / schemas
│   │   │       ├── repositories/ # Database query operations
│   │   │       ├── schemas/      # Pydantic schemas (request/response validation)
│   │   │       └── services/     # Business logic & AI orchestration (Gemini)
│   │   ├── rural_runtime/        # IoT edge runtime & hardware simulator
│   │   │   ├── api.py            # Local agent server endpoint
│   │   │   ├── engine.py         # Hardware telemetry loop & physical state
│   │   │   ├── models.py         # State & configuration models
│   │   │   └── persistence.py    # Local state persistence layer
│   │   ├── supabase/             # Database migration and setup scripts
│   │   ├── tests/                # Test suites for APIs and AI features
│   │   ├── app.py                # Main backend app bootstrapper
│   │   ├── demo.py               # Local command-line simulator demo
│   │   └── requirements.txt      # Python dependencies list
│   │
│   └── web/                      # Frontend Dashboard (Next.js, Tailwind CSS, Framer Motion)
│       ├── public/               # Public assets (images, logos, mockups)
│       ├── src/
│       │   ├── app/              # Next.js App Router structure (pages, layouts)
│       │   │   ├── customer/     # Customer ordering portal
│       │   │   ├── dashboard/    # Fleet operator dashboard (Mission Control)
│       │   │   ├── diagnostics/  # Remote system diagnostics interface
│       │   │   ├── intelligence/ # AI-driven analytics & predictions page
│       │   │   ├── inventory/    # Stock levels and inventory management
│       │   │   ├── orders/       # Order tracking and logs
│       │   │   ├── settings/     # Admin settings & checkouts
│       │   │   ├── telemetry/    # Real-time sensor telemetry dashboard
│       │   │   ├── globals.css   # Main stylesheet containing global styles and theme tokens
│       │   │   └── layout.tsx    # Root layout & Theme provider
│       │   ├── components/       # Custom React components & UI building blocks
│       │   │   ├── ui/           # Shared reusable components (buttons, input, etc.)
│       │   │   │   ├── skiper-ui/ # Specialized UI components
│       │   │   │   └── ...           # Various UI elements (Accordions, Tooltips, Sparks, etc.)
│       │   │   ├── customer/     # Customer portal specific sub-components
│       │   │   ├── ...           # Main dashboard sub-sections (Charts, Tables, etc.)
│       │   │   ├── SdkSandbox.tsx          # Interactive Sandbox Console code panel
│       │   │   ├── DeveloperDocs.tsx       # Embedded interactive documentation viewer
│       │   │   └── CapabilitiesConsole.tsx # Interactive IoT device control dashboard
│       │   ├── data/             # Mock datasets for local development
│       │   ├── hooks/            # Custom React hooks (usePolling, useLiveClock)
│       │   ├── lib/              # Client utilities & shared helpers (api client, logger)
│       │   └── types/            # TypeScript type definitions
│       │
│       ├── package.json          # Frontend dependency and scripts definition
│       └── tsconfig.json         # TypeScript configuration
│
├── docs/                         # General project and architectural documentation
│   └── ARCHITECTURE.md           # System design, layout flow, and team boundaries
│
└── packages/                     # Shared workspaces (internal shared packages)
    ├── config/                   # Shared eslint, tsconfig, styling configs
    ├── shared/                   # Cross-application shared types and utilities
    └── ui/                       # Shared React component library
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js (React 19)
- **Styling:** Tailwind CSS (v4) & CSS Variables
- **Animations:** Framer Motion
- **UI Components:** Radix UI primitives, Lucide Icons, and custom interactive widgets

### Backend
- **Framework:** Python, FastAPI, Uvicorn
- **Database/Storage:** PostgreSQL / Supabase
- **AI Engine:** Google Gemini (for predictive logistics & cargo route optimization)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [Python](https://www.python.org/) (v3.10+ recommended)
- [Git](https://git-scm.com/)

---

### 1. Running the Backend (API)

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   * Copy `.env.example` to `.env` and fill in the required variables (API keys, Supabase URLs, etc.).
5. Start the backend development server:
   ```bash
   python -m uvicorn backend.app.main:app --port 8000 --reload
   ```
   The backend API docs will be available at `http://localhost:8000/docs`.

---

### 2. Running the Frontend (Web)

1. Navigate to the web app directory:
   ```bash
   cd apps/web
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

---

## 🌐 Deploying to Vercel

To deploy the **Next.js frontend** on Vercel:

1. Log in to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import the `gowtham-2006-droid/nexpod-ai-os` repository.
3. Configure the following project settings during import:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/web` (Make sure the option to include files outside the root directory is checked)
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave default/empty (do not override)
4. Click **Deploy**.

---

## ✨ Features Included

*   **Real-time Telemetry Dashboard**: Interactive widgets visualizing water pressure, boiler temperature, and system health status.
*   **Inventory & Ingredients Tracker**: Live meters tracking remaining levels of coffee beans, cups, milk, and water.
*   **Predictive AI Dispatch**: Automated route optimization and restock dispatches powered by AI.
*   **Interactive Customer Terminal**: A customer-facing UI simulating the order, customization (milk type, sweetness level), and payment of drinks.
*   **Remote System Diagnostics**: Real-time diagnostic console simulator to run checks on the pod systems.
*   **Dual-Theme Support**: Flawless switching between dark-mode and light-mode themes with premium styling and accessibility.
*   **Hardware Aesthetics**: Follows the *Console Bezel Design* guidelines keeping simulation and command terminals dark for an authentic hardware feeling in both themes.
