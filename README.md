# NexPod AI OS 🚀

A modern, AI-powered Operating System designed for monitoring, managing, and interacting with a fleet of autonomous, self-service retail pods (starting with automated coffee/tea brewing kiosks).

This repository is organized as a monorepo containing a high-performance Python backend (API, database, and AI engines) and a stunning Next.js-based web frontend (operator dashboard and customer portal) with support for full dark/light themes, real-time telemetry simulation, and predictive maintenance dispatch.

---

## 📂 Repository Structure

```text
├── apps/
│   ├── api/          # Backend (FastAPI, Uvicorn, Supabase, AI/Gemini integrations)
│   └── web/          # Frontend (Next.js, Tailwind CSS, Framer Motion)
├── docs/             # Architecture, design guidelines, and product documentation
└── packages/         # Shared libraries, UI components, and configs
```

- **Frontend (web)**: A premium Next.js dashboard featuring real-time telemetry, inventory tracking, predictive maintenance alerts, an interactive customer ordering terminal, and full light/dark mode support.
- **Backend (api)**: A robust Python FastAPI service providing state management, mock database schemas, and AI-driven predictive logistics using LLMs.

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
