WEN System - Agent Master Implementation Plan
=====================================================

**Context Reference:** @prd.md, @mvp.md, @fastapi, @react, @wen-design-system, @responsive

Phase 0: Infrastructure & Environment Setup
-------------------------------------------

- [x] **Docker Orchestration:** Create docker-compose.yml for TimescaleDB (PostgreSQL 15), Mosquitto MQTT, and Redis (for caching). (`docker-compose.yml`, `infrastructure/mosquitto/mosquitto.conf`, `.env.example`)
- [x] **Backend Boilerplate:** Init FastAPI under /backend.
  - Follow @fastapi: Use lifespan context manager, functional routers, and RORO pattern.
  - Setup requirements.txt: fastapi, uvicorn, pydantic-settings, sqlalchemy>=2.0, asyncpg, paho-mqtt, passlib[argon2].
- [x] **Frontend Boilerplate:** Init Vite + React + TS under /frontend.
  - Follow @react: Setup Shadcn/UI, Tailwind, Zustand, and TanStack Query.
  - Follow @wen-design-system: Configure tailwind (tailwind.config.js or tailwind.config.ts) with design tokens (e.g. --navy, --water, --energy, --solar, surface/border) and map fonts: --font-display (Barlow Condensed), --font-body (Barlow), --font-mono (JetBrains Mono). (`src/index.css` tokens, `tailwind.config.js`, shadcn `Button`, `QueryClient` + `BrowserRouter`, `src/stores/app-store.ts`)

Phase 1: Data Persistence (TimescaleDB)
---------------------------------------

- [x] **Schema Implementation:** Define telemetry_data hypertable with 7-day chunks.
- [x] **Relational Tables:** Implement users, thresholds, and crisis_logs using async SQLAlchemy 2.0 patterns.
- [x] **Pydantic Models:** Define V2 models for RORO data exchange. Use type hints for all signatures.

Phase 2: Async Data Ingestion & BOSB Simulator
----------------------------------------------

- [ ] **MQTT Subscriber:** Implement an async subscriber in /backend/mqtt using guard clauses and early returns.
- [ ] **BOSB Simulation Script:** Build /backend/scripts/simulator.py to generate realistic Automotive/Textile/Food telemetry.
  - Implement the **Nexus Ratio Algorithm** with zero-division protection.

Phase 3: Authentication & Core API
----------------------------------

- [x] **Auth Service:** Implement JWT with Argon2id. Use dependencies for role-based access (STRATEGIC | TECHNICAL).
- [x] **Telemetry Endpoints:**
  - GET /v1/telemetry/live: Real-time polling/socket.
  - GET /v1/telemetry/history: Aggregated time-series data.
- [ ] **Error Handling:** Implement custom error factories and HTTPException handlers.

Phase 4: Frontend Logic & State Management
------------------------------------------

- [x] **Global Stores:** Implement Zustand stores for User Session and Crisis State.
- [x] **Server State:** Setup TanStack Query hooks for telemetry and reports. Use hierarchical query keys.
- [x] **Responsive Layout (mobile-first):** **XS–SM:** single column, bottom tab or compact nav. **MD–LG:** collapsible sidebar, 2–3 column content. **LG+:** fixed 200px sidebar; **XL+:** optional right panel; max content width per @wen-design-system. See @wen-design-system Section 8 and breakpoint rules; align with @responsive.

Phase 5: UI Components & Visualization (NEXUS DS)
-------------------------------------------------

- [x] **KPI Dashboard:** Build **Nexus Health Gauge** and **Maliyet Öngörü** cards; use `var(--water)` / `var(--energy)` / `var(--solar)` only (no raw hex).
- [x] **Technical Charts:** Develop Multi-Axis Line Chart with Recharts; `clamp()` for responsive KPI and display typography per @wen-design-system.
- [ ] **UX states:** Loading (e.g. skeleton), empty (Veri yok / guided actions), and error states for dashboard and lists; `prefers-reduced-motion` for motion.
- [ ] **Accessibility:** WCAG AA contrast, 44x44px touch minimum; @wen-design-system Section 10 (labels, focus, `aria-live` where needed).

Phase 6: Anomaly Engine & "Kod Kırmızı" Protocol
------------------------------------------------

- [ ] **Rule Engine:** Implement the **Smart Summary** logic in the backend.
- [x] **Crisis UI:** **Action Banner** and step-by-step checklist; explicit confirmation for destructive actions (e.g. stop, bulk acknowledge) per @wen-design-system.
- [ ] **Notifications:** Backend alerts to Toast/Alert (danger / warn / ok / info) per @wen-design-system alert patterns.

Phase 7: Reporting & Export
---------------------------

- [ ] **PDF Module:** ESG report generation with WeasyPrint.
- [x] **CSV Export:** Technical data export.
- [ ] **Final Audit:** Lighthouse + @wen-design-system Section 11: tokens, breakpoints, keyboard, NVDA or VoiceOver spot-check, WCAG AA, loading/empty/error, `prefers-reduced-motion`.
