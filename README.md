# WEN Sistemi — Su–Enerji Nexus Karar Destek Paneli

Endüstriyel Su–Enerji Nexus karar destek arayüzü. Stratejik (yönetici) ve Teknik (operasyon) rolleri için canlı telemetri simülasyonu, çok katmanlı kriz protokolü (Sarı / Turuncu / Kod Kırmızı / Acil Su Kesintisi), yapay zeka destekli analiz & raporlama ve fabrika bazlı izleme sunar.

## Canlı Ortam

| Bileşen | URL |
|---------|-----|
| **Frontend (Vercel)** | [https://wen-sistemi-karar-destek-modeli-l7es7vmmj.vercel.app](https://wen-sistemi-karar-destek-modeli-l7es7vmmj.vercel.app) |
| **Backend API (Render)** | [https://wen-sistemi-karar-destek-modeli.onrender.com](https://wen-sistemi-karar-destek-modeli.onrender.com) |
| **API Dokümantasyonu** | [https://wen-sistemi-karar-destek-modeli.onrender.com/docs](https://wen-sistemi-karar-destek-modeli.onrender.com/docs) |

Giriş için aşağıdaki [Test Kullanıcıları](#test-kullanıcıları) tablosunu kullanın.

## Klasör Yapısı

```
/
├── frontend/          # React 19 + TypeScript arayüz (Vite)
├── backend/           # FastAPI arkayüz (Python 3.11+)
├── prodocs/           # Geliştirme referans belgeleri (ajanlar için)
├── infrastructure/    # Mosquitto vb. altyapı config
├── docker-compose.yml # TimescaleDB, Redis, MQTT
├── .env.example       # Ortam değişkeni şablonu (gerçek anahtar yok)
├── .gitignore
└── README.md          # Bu dosya
```

Mobil native gerekirse ileride `/ios` veya `/android` eklenebilir.

## Belgeler (`prodocs/`)

| Dosya | İçerik |
|-------|--------|
| [prodocs/PRD.md](prodocs/PRD.md) | Problem, kullanıcı, temel özellikler |
| [prodocs/tech-stack.md](prodocs/tech-stack.md) | Teknoloji seçimleri ve AI kullanımı |
| [prodocs/Plan.md](prodocs/Plan.md) | Teknik adımlar ve ilerleme |
| [prodocs/DesignSystem.md](prodocs/DesignSystem.md) | Renk, tipografi, bileşen kuralları |
| [prodocs/Progress.md](prodocs/Progress.md) | İş kaydı ve kararlar |
| [prodocs/MVP.md](prodocs/MVP.md) | MVP kapsamı |

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

### Test Kullanıcıları

| Rol | E-posta | Şifre | Erişim |
|---|---|---|---|
| **Stratejik (Yönetici)** | `arif@bosb.gov.tr` | `admin` | Stratejik panel, Trend grafiği, AI Analiz & Rapor, Bildirimler |
| **Teknik (Operasyon)** | `emre@bosb.gov.tr` | `admin` | Operasyon paneli, Ham veri, Anomaliler |

> Her iki rol de `/crisis`, `/simulations` ve `/settings` ekranlarına erişebilir.

---

## Ne Test Edebilirsiniz?

- **Stratejik panel:** KPI kartları, dinamik Nexus Gauge (Rₙ = Eₜ / Wₜ), 6 aylık Enerji & Su trendi (fabrikaya göre değişen statik referans), maliyet & karbon ayak izi tahmini.
- **AI Anlık Analiz:** Mevcut telemetri verisine göre yapay zeka destekli değerlendirme ve aksiyon önerisi (JSON göstergesi yok, okunabilir kart tasarımı).
- **AI Faaliyet Raporu:** Haftalık veya aylık, Türk kamu kurumları faaliyet raporu formatında AI raporu (Yönetici Özeti · Bulgular · Risk Değerlendirmesi · Öneriler · Mevzuat Uyumu).
- **AI Chatbot:** Dashboard'daki anlık Nexus oranı, enerji/su değerleri, kriz seviyesi ve trend verisini okuyabilen bağlam-duyarlı asistan. Kullanıcı adıyla kişisel karşılama.
- **Operasyon paneli:** MQTT mock canlı çoklu eksen grafik, eşik çizgileri, sensör spark-line kartları, son 10 paket tablosu, anomali akışı.
- **Kriz protokolü (`/crisis`):** Sarı → Turuncu checklist → Kod Kırmızı sıralı aksiyon, müdahale simülasyonu (Web Audio API alarm sesi), her adım için audit mock PUT.
- **Kriz debounce:** Uyarı ve başlık durum göstergesi yalnızca ~48 sn süren anormallikte yükselir; anlık spike'lar tetiklemez.
- **Simülasyon Merkezi (`/simulations`):** "Yüksek Su Tüketimi", "Enerji Dalgalanması", "Kod Kırmızı" ve "Acil Su Kesintisi" senaryoları.
- **Ayarlar (`/settings`):** Eşik kaydırıcıları, bildirim/bölge seçenekleri, MQTT simülasyonu, açık/koyu tema.

---

## Tam Kurulum (Backend + Altyapı)

Backend JWT kimlik doğrulama, telemetri, kriz audit ve AI uç noktalarıyla işlevseldir. Frontend hata veya auth yoksa mock veriye otomatik fallback yapar.

1. Kökte `.env` oluşturun: `copy .env.example .env`
2. Altyapıyı başlatın: `docker compose up -d` (TimescaleDB/PostgreSQL 15, Redis, Mosquitto)
3. **Backend** (`/backend`):
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Backend API Uç Noktaları

| Uç Nokta | Açıklama |
|----------|----------|
| `POST /v1/auth/login` | Email + şifre → HS256 JWT token |
| `GET /v1/auth/me` | Bearer token ile oturumdaki kullanıcı bilgisi |
| `GET /v1/telemetry/live` | Anlık telemetri paketi (enerji / su / nexus oranı) |
| `GET /v1/telemetry/history?points=N` | Geçmiş N dakikalık telemetri listesi |
| `PUT /v1/crisis/audit` | Kriz protokol adımını audit tablosuna kaydet |
| `GET /v1/ai/summary` | AI destekli anlık telemetri özeti |
| `GET /v1/ai/report?period=weekly\|monthly` | Kamu kurumu formatında haftalık/aylık faaliyet raporu |
| `POST /v1/ai/chat` | Dashboard bağlamını okuyan AI sohbet asistanı |

### AI Modülü

`OPENROUTER_API_KEY` ve `AI_MODEL` değişkenleri `.env`'de tanımlanır. Varsayılan model: `google/gemini-2.5-flash-lite`. OpenRouter BYOK ile Google AI Studio ücretsiz kotası kullanılabilir.

---

## Frontend ↔ Backend Entegrasyonu

| Kaynak | Davranış |
|--------|----------|
| `useLiveTelemetry` / `useTechnicalSeries` | Backend `/telemetry/*` → başarısız olursa mock simülatör |
| `LoginPage` | Backend `/auth/login` → başarısız olursa mock JWT |
| `audit-client` | Backend `/crisis/audit` PUT → başarısız olursa sessiz mock |
| `AiSummaryCard` / `AiReportCard` / `ChatBot` | Backend `/ai/*` → başarısız olursa hata mesajı |

---

## Teknoloji Yığını

- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS, Zustand, TanStack Query, Recharts, lucide-react, react-router-dom v7
- **Backend:** FastAPI (Python 3.11+), Uvicorn, async SQLAlchemy 2.0, asyncpg, passlib[argon2], python-jose, httpx
- **AI:** OpenRouter API (google/gemini-2.5-flash-lite) — anlık özet, dönemsel rapor, bağlam-duyarlı chatbot
- **Altyapı:** TimescaleDB / PostgreSQL 15, Redis, Mosquitto (MQTT)

## Ek Referanslar

- [prd.md](prd.md) — Teknik PRD (ER diyagramı)
- [plan.md](plan.md) → [prodocs/Plan.md](prodocs/Plan.md)
- [frontend/user flow.md](frontend/user%20flow.md) — UI akışı ve Nexus eşik tanımları
- [.cursor/rules/](.cursor/rules/) — Cursor kodlama kuralları
