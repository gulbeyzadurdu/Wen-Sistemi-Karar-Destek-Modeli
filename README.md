# WEN Sistemi — Su–Enerji Nexus Karar Destek Paneli

Endüstriyel Su–Enerji Nexus karar destek arayüzü. Stratejik (yönetici) ve Teknik (operasyon) rolleri için, canlı telemetri simülasyonu, çok katmanlı kriz protokolü (Sarı / Turuncu / Kod Kırmızı / Acil Su Kesintisi), ESG çıktıları ve fabrika bazlı izleme akışı sunar.

---

## Hızlı Başlangıç (Yalnızca Frontend — önerilen test yolu)

Frontend tamamen **mock veri** ile çalışır; demoyu denemek için backend veya Docker gerekmez.

```bash
git clone <repo-url>
cd "WEN Sistemi - Karar Destek Modeli/frontend"
npm install
npm run dev
```

Tarayıcıda açın: **http://localhost:5173**

### Test Kullanıcıları (Mock JWT)

Giriş ekranında aşağıdaki hesaplardan birini kullanın:

| Rol | Kullanıcı Adı | Şifre | Erişim |
|---|---|---|---|
| **Stratejik (Yönetici)** | `admin@bosb.gov.tr` | `admin` | Stratejik panel, Trend analizi, ESG raporu, Bildirimler |
| **Teknik (Operasyon)** | `operator@bosb.gov.tr` | `operator` | Operasyon paneli, Ham veri, Anomaliler |

> Her iki rol de `/crisis`, `/simulations` ve `/settings` ekranlarına erişebilir. Oturum bilgisi `localStorage` üzerinde tutulur; `Ayarlar → Oturumu kapat` ile temizlenir.

---

## Ne Test Edebilirsiniz?

- **Stratejik panel:** KPI kartları, dinamik Nexus Gauge (Rₙ = Eₜ / Wₜ), 6 aylık ESG trend grafiği, fabrika seçimi (BOSB geneli ↔ tek fabrika), maliyet & karbon ayak izi tahmini.
- **Operasyon paneli:** MQTT mock canlı çoklu eksen grafik, eşik referans çizgileri, sensör spark-line kartları (pompa / vana / basınç), son 10 paket tablosu, anomali akışı.
- **Kriz protokolü (`/crisis`):** Seviye makinesi (Sarı → Turuncu hazırlık checklist'i → Kod Kırmızı sıralı aksiyon checklist'i), her adım için audit mock PUT.
- **Simülasyon Merkezi (`/simulations`):** "Yüksek Su Tüketimi", "Enerji Dalgalanması", "Kod Kırmızı" ve "Acil Su Kesintisi" senaryolarını manuel tetikleme; sahaya bildirim akışı simülasyonu.
- **Ayarlar (`/settings`):** Eşik kaydırıcıları (fabrika bazlı), bildirim/bölge/dil seçenekleri, MQTT bağlantı simülasyonu (Online ↔ Redis fallback), açık/koyu tema.

---

## Tam Kurulum (Backend + Altyapı)

Backend artık JWT kimlik doğrulama, telemetri ve kriz audit uç noktalarıyla işlevsel durumdadır. Frontend, gerçek API'ye bağlanır; hata veya auth yoksa mock veriye fallback yapar.

1. Kökte `.env` oluşturun: `copy .env.example .env`
2. Altyapıyı başlatın: `docker compose up -d` (TimescaleDB/PostgreSQL 15, Redis, Mosquitto)
3. **Backend** (`/backend`):
   - `python -m venv .venv` ve `.\.venv\Scripts\activate` (Windows)
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - Sağlık kontrolü: [GET /v1/health](http://127.0.0.1:8000/v1/health)
   - Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Backend API Uç Noktaları

| Uç Nokta | Açıklama |
|----------|----------|
| `POST /v1/auth/login` | Email + şifre → HS256 JWT token |
| `GET /v1/auth/me` | Bearer token ile oturumdaki kullanıcı bilgisi |
| `GET /v1/telemetry/live` | Anlık telemetri paketi (enerji / su / nexus oranı) |
| `GET /v1/telemetry/history?points=N` | Geçmiş N dakikalık telemetri listesi |
| `PUT /v1/crisis/audit` | Kriz protokol adımını audit tablosuna kaydet |

---

## Frontend ↔ Backend Entegrasyonu

`frontend/src/lib/api-client.ts` gerçek API istemcisini sağlar. Her uç nokta için **önce backend denenir, hata veya auth yoksa mock veriye otomatik fallback** yapılır — bu sayede backend olmadan demo çalışmaya devam eder.

| Kaynak | Davranış |
|--------|----------|
| `useLiveTelemetry` / `useTechnicalSeries` | Backend `/telemetry/live` ve `/telemetry/history` → başarısız olursa mock simülatör |
| `LoginPage` | Backend `/auth/login` → başarısız olursa mock JWT |
| `audit-client` | Backend `/crisis/audit` PUT → başarısız olursa sessiz mock |

---

## Teknoloji Yığını

- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS, Zustand, TanStack Query, Recharts, lucide-react, react-router-dom v7
- **Backend:** FastAPI (Python 3.11+), Uvicorn, async SQLAlchemy 2.0, asyncpg, passlib[argon2], python-jose
- **Altyapı:** TimescaleDB / PostgreSQL 15, Redis, Mosquitto (MQTT)

## Proje Belgeleri

- [plan.md](plan.md) — Faz 0-3 yol haritası
- [prd.md](prd.md) — Ürün gereksinimleri
- [mvp.md](mvp.md) — MVP kapsamı
- [frontend/user flow.md](frontend/user%20flow.md) — Detaylı UI akışı ve Nexus eşik tanımları
- [.cursor/rules/](.cursor/rules/) — Cursor kodlama kuralları
