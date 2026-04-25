# WEN — Water–Energy Nexus Karar Destek Sistemi

## Geliştirme ortamı (Faz 0)

1. Kökte `.env` oluşturun: `.env.example` dosyasını kopyalayın (`copy .env.example .env`).
2. Altyapıyı ayağa kaldırın: `docker compose up -d` (TimescaleDB/PostgreSQL 15, Redis, Mosquitto).
3. **Backend** (`/backend`):
   - `python -m venv .venv` ve `.\.venv\Scripts\activate` (Windows)
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - Sağlık: [GET /v1/health](http://127.0.0.1:8000/v1/health) ve [POST /v1/health](http://127.0.0.1:8000/v1/health) (RORO `include_details` gövdesi)
4. **Frontend** (`/frontend`):
   - `npm install`
   - `npm run dev` → [http://localhost:5173](http://localhost:5173)

Uygulama ayrıntıları ve fazlar için kök [plan.md](plan.md), [prd.md](prd.md) ve [mvp.md](mvp.md) dosyalarına bakın; Cursor kuralları `.cursor/rules/` altında.
