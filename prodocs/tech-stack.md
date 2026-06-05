# tech-stack.md — Teknoloji Yığını ve Gerekçeler

## Genel Mimari

```
[MQTT Sensörler] → [Mosquitto] → [Backend FastAPI] → [TimescaleDB]
                                        ↓
                              [React Frontend :5173]
                                        ↓
                              [OpenRouter AI (BYOK)]
```

Demo/MVP'de telemetri ve anomali verisi büyük ölçüde **mock**; şema ve API uç noktaları üretime hazır iskelet sunar.

---

## Frontend (`/frontend`)

| Teknoloji | Gerekçe |
|-----------|---------|
| **React 19 + TypeScript** | Bileşen tabanlı dashboard; tip güvenliği |
| **Vite** | Hızlı HMR, düşük build süresi |
| **Tailwind CSS** | Token tabanlı NEXUS DS; utility-first |
| **Shadcn/UI** | Erişilebilir, özelleştirilebilir primitives (`Button` vb.) |
| **Zustand** | Hafif global state (auth, crisis, ops, threshold) |
| **TanStack Query** | Telemetri polling (12 sn), cache, loading/error state |
| **Recharts** | Çok eksenli endüstriyel grafikler |
| **react-router-dom v7** | Rol bazlı rota koruması |
| **lucide-react** | Tutarlı ikon seti |

**AI kullanımı (geliştirme):** Cursor ajanları `@react`, `@wen-design-system`, `@responsive` kurallarını izler. UI değişikliklerinde `prodocs/DesignSystem.md` referans alınır.

---

## Backend (`/backend`)

| Teknoloji | Gerekçe |
|-----------|---------|
| **FastAPI (Python 3.11+)** | Async, OpenAPI/Swagger, Pydantic entegrasyonu |
| **Uvicorn** | ASGI sunucu, `--reload` geliştirme |
| **SQLAlchemy 2.0 (async)** | TimescaleDB/PostgreSQL ORM |
| **asyncpg** | Yüksek performanslı async PostgreSQL sürücüsü |
| **Pydantic v2 + pydantic-settings** | RORO şemalar, merkezi `.env` config |
| **passlib[argon2]** | Güvenli parola hash |
| **python-jose** | HS256 JWT |
| **httpx** | OpenRouter async HTTP istemcisi |
| **paho-mqtt** | MQTT aboneliği (üretim fazı — henüz kodlanmadı) |

**AI kullanımı (runtime):** `backend/app/api/v1/routes/ai.py` → OpenRouter Chat Completions API. Kural motoru (`_run_rule_engine`) prompt'u zenginleştirir.

---

## Altyapı

| Servis | Gerekçe |
|--------|---------|
| **TimescaleDB / PostgreSQL 15** | Zaman serisi telemetri hypertable, 7 günlük chunk |
| **Redis** | MQTT kopunca önbellek (üretim fazı) |
| **Mosquitto MQTT** | IoT sensör mesajlaşması |
| **Docker Compose** | Tek komutla yerel altyapı |

---

## AI Entegrasyonu

| Alan | Değer |
|------|--------|
| **Sağlayıcı** | OpenRouter (BYOK) |
| **Varsayılan model** | `google/gemini-2.5-flash-lite` |
| **Anahtar** | `OPENROUTER_API_KEY` (`backend/.env`) |
| **Uç noktalar** | `/v1/ai/summary`, `/v1/ai/report`, `/v1/ai/chat` |

**Geliştirme sürecinde AI:** Özellik implementasyonu, UX state'leri, kural motoru ve dokümantasyon Cursor ajanları ile iteratif yapıldı. Ajanlar `prodocs/` belgelerini bağlam olarak kullanır.

---

## Ortam Değişkenleri

Kök `.env.example` şablonunu kopyalayın: `copy .env.example .env` (Windows) veya `cp .env.example .env`.

Kritik değişkenler: `DATABASE_URL`, `SECRET_KEY`, `OPENROUTER_API_KEY`, `AI_MODEL`, `CORS_ORIGINS`.

---

## Mobil (Gelecek)

MVP yalnızca responsive web (`/frontend`). Native mobil gerekirse `/ios` veya `/android` klasörleri eklenebilir; API aynı kalır.
