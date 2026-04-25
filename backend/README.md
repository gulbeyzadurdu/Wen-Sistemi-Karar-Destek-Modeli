# WEN API (FastAPI)

- **Çalıştırma (backend klasöründen):** `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- **Ortam:** Kökteki `.env` veya bu klasörde `.env` — `CORS_ORIGINS`, `DATABASE_URL` vb. (bkz. kök `.env.example`).

Kod: lifespan, RORO örneği `app/services/health.py` + `POST /v1/health` gövdesi, fonksiyonel router yapısı.
