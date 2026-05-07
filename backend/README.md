# WEN API (FastAPI)

> ⚠️ **Test edenler için not:** Frontend tamamen mock veri ile çalıştığı için demo denemesi için backend'i çalıştırmanız **gerekmez**. Yalnızca `/frontend` klasöründen `npm install && npm run dev` yeterlidir. Backend, ileri faz entegrasyonu için iskelet hâlinde duruyor.

## Çalıştırma

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate        # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Sağlık Uçları

- `GET  /v1/health` — basit OK yanıtı
- `POST /v1/health` — RORO gövdesi: `{ "include_details": true }` ile detaylı çıktı

## Ortam Değişkenleri

Kökteki `.env` dosyası kullanılır (örnek için kök `.env.example`). Önemli anahtarlar:

- `CORS_ORIGINS` — frontend dev sunucusu için (varsayılan `http://localhost:5173`)
- `DATABASE_URL` — TimescaleDB / PostgreSQL 15

## Mimari

- FastAPI **lifespan** ile başlatma/durdurma
- **RORO** örneği: `app/services/health.py` + `POST /v1/health` gövdesi
- **Fonksiyonel router** yapısı: `app/api/v1/`
