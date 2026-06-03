# WEN API (FastAPI)

> ⚠️ **Test edenler için not:** Frontend tamamen mock veri ile çalışabilir; demo için backend'i çalıştırmanız **zorunlu değildir**. Yalnızca `/frontend` klasöründen `npm install && npm run dev` yeterlidir. Ancak backend artık gerçek JWT kimlik doğrulama, telemetri, kriz audit ve AI uç noktalarıyla tam işlevsel bir API sunmaktadır.

---

## Çalıştırma

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate        # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## API Uç Noktaları

### Sağlık

| Metot | Yol | Açıklama |
|-------|-----|----------|
| `GET` | `/v1/health` | Basit OK yanıtı |
| `POST` | `/v1/health` | `{ "include_details": true }` ile detaylı durum |

### Kimlik Doğrulama (`/v1/auth`)

| Metot | Yol | Açıklama |
|-------|-----|----------|
| `POST` | `/v1/auth/login` | Email + şifre ile **HS256 JWT** token al |
| `GET` | `/v1/auth/me` | Bearer token ile oturumdaki kullanıcı bilgisini döner |

**Login isteği:**
```json
{ "email": "user@bosb.gov.tr", "password": "şifre" }
```
**Token yanıtı:**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

### Telemetri (`/v1/telemetry`) — Bearer token gerektirir

| Metot | Yol | Açıklama |
|-------|-----|----------|
| `GET` | `/v1/telemetry/live` | Anlık simülasyon telemetri paketi (energy, water, nexus_ratio) |
| `GET` | `/v1/telemetry/history?points=50` | Geriye doğru N dakikalık paket listesi (varsayılan 50, maks 1000) |

### Kriz Audit (`/v1/crisis`) — Bearer token gerektirir

| Metot | Yol | Açıklama |
|-------|-----|----------|
| `PUT` | `/v1/crisis/audit` | Kriz protokol adımını `crisis_audit_logs` tablosuna kaydeder |

**Audit isteği:**
```json
{ "step_id": "orange-step-1", "timestamp": "2026-05-26T12:00:00Z", "user_id": "<uuid>" }
```

### AI (`/v1/ai`) — Bearer token gerektirir

| Metot | Yol | Açıklama |
|-------|-----|----------|
| `GET` | `/v1/ai/summary` | Anlık telemetri verisiyle AI destekli değerlendirme ve aksiyon önerisi |
| `GET` | `/v1/ai/report?period=weekly\|monthly` | Kamu kurumu formatında dönemsel faaliyet raporu |
| `POST` | `/v1/ai/chat` | Dashboard bağlamını (enerji/su/Rₙ/kriz/trend) okuyan AI sohbet asistanı |

**AI modeli:** `google/gemini-2.5-flash-lite` (OpenRouter üzerinden). `.env`'deki `AI_MODEL` ile değiştirilebilir.

**OpenRouter BYOK:** Google AI Studio API key'ini [openrouter.ai/settings/integrations](https://openrouter.ai/settings/integrations) → Provider Keys → Google AI Studio bölümüne ekleyerek Google'ın ücretsiz kotasını kullanabilirsiniz.

---

## Veritabanı Katmanı

Backend, **async SQLAlchemy 2.0** + **asyncpg** kullanır ve uygulama başlangıcında (`lifespan`) şunları otomatik çalıştırır:

1. `Base.metadata.create_all` — tüm ORM tablolarını oluşturur / doğrular.
2. `create_hypertable('telemetry_data', 'time', ...)` — TimescaleDB extension varsa `telemetry_data` tablosunu 7 günlük chunk'larla hypertable'a dönüştürür.

### ORM Modelleri (`app/models/`)

| Model | Tablo | Açıklama |
|-------|-------|----------|
| `User` | `users` | Kullanıcılar; rol: `STRATEGIC` / `TECHNICAL` |
| `Factory` | `factories` | Fabrika varlıkları ve anlık Nexus durumu |
| `Sensor` | `sensors` | Fabrikaya bağlı sensörler (`ENERGY / WATER / COMBINED`) |
| `TelemetryData` | `telemetry_data` | TimescaleDB hypertable (zaman serisi) |
| `Threshold` | `thresholds` | Fabrika bazlı alarm eşikleri |
| `Anomaly` | `anomalies` | Tespit edilen anomaliler ve çözüm durumu |
| `CrisisEvent` | `crisis_events` | Kriz olayları (`yellow / orange / red / KOD_KIRMIZI`) |
| `CrisisAuditLog` | `crisis_audit_logs` | Kriz protokol adım kayıtları |
| `SimulationRun` | `simulation_runs` | Senaryo simülasyon çalıştırmaları |
| `Notification` | `notifications` | Kullanıcı bildirimleri |
| `RefreshToken` | `refresh_tokens` | JWT yenileme token'ları |

---

## Güvenlik

- **Şifre hash'leme:** Argon2id (`passlib[argon2]`)
- **JWT:** HS256, `python-jose[cryptography]` — varsayılan ömür 60 dakika
- **Bearer token doğrulama:** `app/api/deps.py` → `get_current_user` bağımlılığı

---

## Ortam Değişkenleri

Kökteki `.env` dosyası kullanılır (örnek için kök `.env.example`). Önemli anahtarlar:

| Değişken | Varsayılan | Açıklama |
|----------|-----------|----------|
| `DATABASE_URL` | `postgresql+asyncpg://wen:wen_dev@localhost:5432/wen` | Async SQLAlchemy URL (TimescaleDB/PostgreSQL 15) |
| `SECRET_KEY` | `change-me-in-production` | **Üretimde mutlaka değiştirilmelidir** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT ömrü (dakika) |
| `CORS_ORIGINS` | `http://localhost:5173` | Frontend dev sunucusu için virgülle ayrılmış origin'ler |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis bağlantı URL'i |
| `OPENROUTER_API_KEY` | — | OpenRouter API anahtarı (AI uç noktaları için zorunlu) |
| `AI_MODEL` | `google/gemini-2.5-flash-lite` | OpenRouter model slug'ı |

---

## Migrasyon Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `migrations/001_crisis_audit_log_nullable_crisis_event_id.sql` | `crisis_audit_logs.crisis_event_id` kolonunu nullable yapar (mevcut tablo için) |

> Yeni kurulumda bu migrasyon gerekmez; `init_db()` zaten `nullable=True` ile oluşturur.

---

## Mimari

- FastAPI **lifespan** ile başlatma/durdurma ve DB init
- **RORO** örneği: `app/services/health.py` + `POST /v1/health` gövdesi
- **Fonksiyonel router** yapısı: `app/api/v1/`
- `app/api/deps.py` — tüm router'lar arasında paylaşılan bağımlılıklar
- AI modülü (`app/api/v1/routes/ai.py`) — OpenRouter üzerinden Gemini entegrasyonu; JSON fence soyma, bağlam enjeksiyonu, markdown kod bloğu parse desteği
