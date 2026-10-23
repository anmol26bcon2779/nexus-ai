# NEXUS AI — Complete AI Business Automater

> **One workspace. Every tool. Smarter business.**

Nexus AI connects business tools, automates repetitive operational workflows, coordinates local and national deliveries, and equips business owners with a central AI copilot to manage operations.

---

## 🌟 Key Features

### 1. 🎛️ Business Command Center
- Live operational dashboard monitoring active automations, delivery statuses, pending approvals, and time saved.
- Multi-metric activity chart tracking daily executions, orders, and dispatched couriers.
- Urgent operational alerts banner with 1-click resolution actions.
- AI Operations Intelligence surfacing autonomous cost optimizations.

### 2. 🔌 Integrations Hub
- Reusable adapter architecture declaring supported triggers, actions, and credentials.
- Pre-configured integrations with safe demo sandboxes:
  - **Shopify & WooCommerce:** Real-time order sync, catalog retrieval, fulfillment updates.
  - **Porter Local Logistics:** Intra-city on-demand 2-wheelers and mini trucks with Indian pin code distance algorithms.
  - **Shiprocket Pan-India:** Multi-courier aggregator (Blue Dart, Delhivery, DTDC, Ecom Express) across 28,000+ pin codes.
  - **WhatsApp Business Platform:** Order dispatch notices, live tracking links, lead follow-ups.
  - **Slack:** Leadership channel alerts, approval requests, and daily executive digests.
  - **Google Sheets & Gmail:** Audit row recording, stock tracking, and supplier PO drafting.
  - **Instagram Direct:** DM capture, automated intent qualification, and reply drafting.

### 3. ⚡ Automation Studio & Workflow Engine
- Natural language to workflow generator.
- Robust execution engine with allowlisted, safe triggers and actions (no arbitrary code execution).
- Sequential node pipelines with conditions, branching, AI transformations, and error handling.
- Step-by-step audit logging with duration benchmarks and payload inspection.

### 4. 🚚 Orders & Smart Delivery Management
- **Smart Logistics Assignment:**
  1. Validates origin and destination pin codes (e.g. 560xxx intra-city Bengaluru vs 400xxx Mumbai).
  2. Queries Porter and Shiprocket adapter endpoints for available quotes.
  3. Compares actual rates, estimated delivery times, and weight restrictions.
  4. Recommends the optimal carrier with clear reasoning.
  5. Enforces human confirmation if order value exceeds the configurable threshold (₹10,000).
  6. Books shipment with idempotency keys and generates live demo tracking IDs (`DEMO-PTR-...`, `DEMO-AWB-...`).
  7. Maintains a full tracking lifecycle timeline.

### 5. 👥 Leads & Customer Pipeline
- Inbound lead qualification engine:
  `Lead submitted → validate → score intent (1-100) → draft WhatsApp message → create sales task → record execution result`.

### 6. 🛡️ Approvals Gate
- Human-in-the-loop protection against high-cost courier bookings, cancellations, and mass customer messaging.

### 7. 📊 Business Analytics
- Real metrics calculated directly from database records (order volume, delivery completion rate, average courier spend, labor time saved).

### 8. 🤖 AI Business Assistant
- Central conversational copilot with business context awareness.
- Provides actionable answers, summary bullets, and direct jump actions.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Glassmorphism UI.
- **Backend:** Node.js, Express, TypeScript (`tsx`), REST API, Thread-safe Data Store.
- **Delivery Adapters:** Porter Intra-City Express Adapter, Shiprocket Pan-India Adapter.
- **Design Inspiration:** Linear, Stripe, Vercel.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v20.18.0)
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/anmol26bcon2779/nexus-ai.git
cd nexus-ai

# Install dependencies
npm install

# Run both Backend API (port 3001) and Frontend Vite (port 5173)
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Scripts
- `npm run dev:all` — Launches backend API server (`:3001`) and Vite frontend (`:5173`) concurrently.
- `npm run server` — Runs the Express backend server with live reload.
- `npm run dev` — Runs Vite frontend dev server with API proxy.
- `npm run build` — Runs TypeScript compiler and produces production Vite build in `dist/`.

---

## 🔒 Security & Sandbox Guarantees

- **Zero-Risk Demo Mode:** All courier quotes, tracking records, and webhook deliveries run in safe simulation mode by default.
- **Credential Protection:** Secrets and API tokens remain securely on the server and are never exposed to client-side code.
- **Idempotency Keys:** Every courier booking and workflow execution uses unique idempotency keys to prevent duplicate dispatches.

---

## 📄 License
MIT License. Built for hackathon and enterprise automation showcase.
