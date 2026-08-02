# NexPod AI OS 🚀

> **The Predictive Intelligence Operating System for Autonomous Retail Fleets.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

NexPod AI OS is an end-to-end operating system designed for monitoring, managing, and automating fleets of autonomous retail pods (smart beverage kiosks, self-service micro-stores, and unmanned vending hubs). 

It bridges physical hardware telemetry with cloud-native predictive AI — replacing reactive, manual servicing with real-time anomaly detection, automated inventory replenishment, and dual-LLM operational intelligence.

---

## 🌟 Key Features

### 1. 📊 Mission Control Dashboard
- **Live Fleet KPIs**: Real-time gross revenue (INR), order counts, machine health, inventory levels, and active alert counters.
- **Interactive Visualizations**: Hourly order volume, product sales breakdown, and revenue trends with inline sparklines.
- **Incident Replay Drawer**: Step-by-step forensic event timeline scrubbing through past alerts, telemetry spikes, and state transitions.

### 2. ⚡ Real-Time Telemetry & Sensor Console
- **5-Second IoT Polling**: Live monitoring of boiler temperature, power draw (W), network latency (ms), payment terminal readiness, and magnetic door locks.
- **Digital Twin Visuals**: Sensor cards with status indicators and historical trend curves.

### 3. 🤖 ML-Powered Predictive Maintenance Engine
- **Two-Phase Anomaly Detection**:
  - *Phase 1 (Warming Up)*: Instant Z-score rolling window on sensor features.
  - *Phase 2 (Trained)*: On-device `scikit-learn` **Isolation Forest** trained after 30 ticks and retrained automatically every 20 ticks.
- **Composite Risk Scoring**: Generates a unified risk score `[0.0 - 1.0]` flagging thermal runaway, PSU instability, and network degradation before failures happen.

### 4. 🧠 Dual-LLM AI Operations Intelligence
- **Google Gemini 2.5 Flash**: Translates structured pod telemetry into validated, domain-specific insights (Inventory, Maintenance, Business, Demand Forecast).
- **Groq LLaMA 3.3 70B Chat Co-Pilot**: Conversational assistant embedded in the sidebar with live context of pod vitals, alerts, and sales data.
- **Executive Daily Reports**: AI-synthesized daily operational reports with actionable recommendations and predictive forecasts.

### 5. 🔄 Autonomous Inventory & Auto-Replenishment
- **Threshold-Based Reordering**: Monitors ingredient reserves (coffee beans, milk, water, cups).
- **Closed-Loop Automation**: Automatically dispatches replenishment tasks when stock drops below safe reorder thresholds.

### 6. 📱 Walk-Up Customer Kiosk Simulator
- **Interactive Checkout Flow**: Simulates customer order selection, beverage customization (sweetness, milk choice), and multi-payment options (UPI, Card, Cash).
- **Closed-Loop Integration**: Deducts real inventory, updates revenue, and triggers telemetry changes in the backend in real time.

---

## 🔑 Demo Credentials

| Role | Access URL | Email / Username | Password |
|---|---|---|---|
| **Admin** | `/login` | `innovex` *(or `innovex@nexpod.ai`)* | `innovex` |
| **Customer App** | `/customer` | *No login required* | *N/A* |

> 💡 **Quick Sign-in**: Click the **Auto-fill Credentials** button on the `/login` page for instant sub-50ms sign-in.

---

## 📂 Repository Structure

```text
nexpod-ai-os/
├── apps/
│   ├── api/                      # Python FastAPI Backend
│   │   ├── backend/app/
│   │   │   ├── api/              # REST Endpoints (/dashboard, /orders, /anomaly, etc.)
│   │   │   ├── core/             # Configuration & Security settings
│   │   │   ├── database/         # Supabase PostgreSQL session management
│   │   │   ├── schemas/          # Pydantic validation contracts
│   │   │   └── services/         # AI Service (Gemini), Anomaly ML (IsoForest), Incident & Report Services
│   │   ├── pod_runtime/          # Deterministic in-memory simulation engine
│   │   │   ├── engine.py         # Hardware telemetry simulator & event loop
│   │   │   └── models.py         # Frozen immutable data contracts
│   │   ├── tests/                # Pytest test suite (59 unit/integration tests)
│   │   └── requirements.txt      # Python dependencies
│   │
│   └── web/                      # Next.js 16 Digital Twin Frontend
│       ├── src/
│       │   ├── app/              # Next.js App Router (dashboard, telemetry, customer, login, etc.)
│       │   ├── components/       # UI Components (OrdersTable, AIReasoningPanel, Globe, etc.)
│       │   ├── hooks/            # Custom React hooks (usePolling, useWebSocket, useLiveClock)
│       │   └── lib/              # API Client & authentication state helpers
│       └── package.json          # Node dependencies
│
└── docs/                         # System architecture documentation
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS (v4), Framer Motion, Radix UI primitives, Lucide Icons.
- **Backend**: Python 3.14 / 3.10+, FastAPI, Uvicorn, Pydantic v2.
- **Machine Learning**: `scikit-learn` (Isolation Forest), `numpy` (Z-score rolling window).
- **LLM Integrations**: Google Gemini 2.5 Flash, Groq LLaMA 3.3 70B.
- **Database / Auth**: Supabase PostgreSQL, HMAC-SHA256 Signed JWTs, FastAPI RBAC.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.10+ (recommended v3.14)
- **Git**

---

### 2. Backend Setup (FastAPI)

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (Optional):
   Create a `.env` file in `apps/api/`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GROK_API_KEY=your_groq_api_key
   ```
5. Start the backend server:
   ```bash
   python -m uvicorn backend.app.main:app --port 8000 --reload
   ```
   *Swagger API Documentation will be available at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup (Next.js)

1. Navigate to the web app directory:
   ```bash
   cd apps/web
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Running Tests

Run the full pytest backend test suite (59 passed):
```bash
# From workspace root:
$env:PYTHONPATH="apps/api"; python -m pytest apps/api/tests
```

To test the frontend build:
```bash
cd apps/web
npm run build
```

---

## 🌐 Deployment (Vercel)

The Next.js frontend is configured for seamless deployment on Vercel:

1. Import repository `gowtham-2006-droid/nexpod-ai-os` into Vercel.
2. Set **Root Directory** to `apps/web`.
3. Framework Preset: `Next.js`.
4. Build Command: `npm run build`.

---

## 📄 License

This project is licensed under the MIT License.
