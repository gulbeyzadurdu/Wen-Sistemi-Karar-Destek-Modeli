WEN Sistemi — Ana Uygulama Planı
=====================================================

**Bağlam Referansları:** [PRD.md](./PRD.md), [MVP.md](./MVP.md), [DesignSystem.md](./DesignSystem.md), [tech-stack.md](./tech-stack.md)
**Yığın:** React 19 + TypeScript + Vite · FastAPI (Python 3.11+) · TimescaleDB · Redis · Mosquitto MQTT · OpenRouter AI (BYOK — Google AI Studio)

> **Demo durumu:** Aşağıdaki `[x]` maddeler MVP/demo kapsamında çalışır durumdadır. Gerçek sensör verisi, MQTT aboneliği ve üretim kalitesi özellikleri **Kapsam Dışı** bölümündedir.

---

Faz 0: Altyapı ve Ortam Kurulumu
--------------------------------

- [x] **Docker Orkestrasyonu** — TimescaleDB (PostgreSQL 15), Mosquitto MQTT, Redis (`docker-compose.yml`, `infrastructure/mosquitto/mosquitto.conf`, `.env.example`)
- [x] **Backend İskeleti** — FastAPI, lifespan, fonksiyonel router'lar, RORO deseni (`/backend`)
- [x] **Frontend İskeleti** — Vite + React + TS, Shadcn/UI, Tailwind, Zustand, TanStack Query, tasarım token'ları (`/frontend`)

Faz 1: Veri Kalıcılığı (TimescaleDB)
------------------------------------

- [x] **Şema Uygulaması** — `telemetry_data` hypertable, 7 günlük chunk (`backend/app/models/telemetry.py`, `init_db`)
- [x] **İlişkisel Tablolar** — users, thresholds, crisis_audit_logs ve ilişkili modeller (async SQLAlchemy 2.0)
- [x] **Pydantic Modelleri** — auth, telemetry, crisis, health şemaları (Pydantic v2, type hints)

Faz 2: Kimlik Doğrulama ve Temel API
------------------------------------

- [x] **Kimlik Doğrulama Servisi** — Argon2id + JWT, login/me uç noktaları; rol ayrımı frontend `RoleGate` ile
- [x] **Telemetri Uç Noktaları** — `GET /v1/telemetry/live`, `GET /v1/telemetry/history` (demo: simülasyon verisi; frontend mock fallback)
- [x] **Hata Yönetimi** — `ai.py` JSON parse fallback, 502 upstream handling, `pydantic-settings` merkezi config

Faz 3: Frontend Mantığı ve Durum Yönetimi
-----------------------------------------

- [x] **Global Store'lar** — auth, crisis, ops, threshold, connection, theme (Zustand)
- [x] **Sunucu Durumu** — TanStack Query hook'ları, hiyerarşik query key'ler (`useLiveTelemetry`, `useAnomalies`)
- [x] **Duyarlı Düzen** — mobile-first; `MobileNav`, sabit sidebar, `max-w-content` (`AppShell`)

Faz 4: UI Bileşenleri ve Görselleştirme (NEXUS DS)
--------------------------------------------------

- [x] **KPI Paneli** — Nexus Sağlık Göstergesi, Maliyet Öngörü kartları (`StrategicDashboardPage`, `NexusGauge`)
- [x] **Teknik Grafikler** — çok eksenli Recharts grafikleri (`TechnicalLiveChart`, `StrategicTrendChart`)
- [x] **UX Durumları** — Skeleton, empty ve error state (`StrategicDashboardPage`, `TechnicalDashboardPage`, `AnomaliesPage`)

Faz 5: Anomali Motoru ve "Kod Kırmızı" Protokolü
------------------------------------------------

- [x] **Kural Motoru** — `_run_rule_engine` (R01–R05), AI özet prompt'una bağlam enjeksiyonu (`backend/app/api/v1/routes/ai.py`)
- [x] **Kriz Arayüzü** — Action Banner, protokol kontrol listesi, kriz audit API (`CrisisActionBanner`, `CrisisPage`, `ProtocolChecklist`)

Faz 6: Raporlama ve Dışa Aktarım
--------------------------------

- [x] **CSV Dışa Aktarım** — `data-exporter.ts` (ESG raporu sayfası) ve `HistoricalPage` (ham telemetri snapshot)

Faz 7: AI Entegrasyonu
----------------------

- [x] **AI Özet** — `GET /v1/ai/summary`
- [x] **AI Rapor** — `GET /v1/ai/report` (haftalık/aylık faaliyet raporu)
- [x] **AI Sohbet** — `POST /v1/ai/chat` (bağlam-duyarlı dashboard verisi)
- [x] **Frontend AI Bileşenleri** — `AiSummaryCard`, `AiReportCard`, `ChatBot` (yükleme/hata durumları)
- [x] **Model Yapılandırması** — `AI_MODEL` + `OPENROUTER_API_KEY` via `.env`

---

Kapsam Dışı — Üretim Fazı
--------------------------

Demo/MVP kapsamı dışında; üretim geçişinde uygulanacaktır.

- [ ] **MQTT Abonesi** — `/backend/mqtt` asenkron subscriber (şu an `telemetry-mock.ts`)
- [ ] **BOSB Simülasyon Betiği** — `/backend/scripts/simulator.py` (şu an backend `random` + frontend mock)
- [ ] **TimescaleDB Canlı Bağlantı** — telemetri uç noktalarının gerçek sensör verisi okuması (şema hazır, veri yolu mock)
- [ ] **Canlı Anomali Akışı** — MQTT/Timescale tabanlı anomali beslemesi (şu an `mocks/anomalies.ts`)
- [ ] **Yönetici Paneli** — kullanıcı yönetimi, rol atama, hesap oluşturma (şu an iki sabit test kullanıcısı)
- [ ] **Backend Rol Koruması** — `require_role(STRATEGIC | TECHNICAL)` API dependency (şu an yalnızca frontend RBAC)
- [ ] **Backend Bildirim Servisi** — e-posta ve push bildirimleri (şu an `CrisisStrip`, `DataOfflineBanner` ile kısmi UI)
- [ ] **WeasyPrint PDF Modülü** — backend ESG raporu + Yeşil Mutabakat Kapsam 3 emisyon verisi
- [ ] **AI Rapor PDF Dışa Aktarımı** — `AiReportCard` print API ile PDF indirme (şu an yalnızca ekranda görüntüleme)
- [ ] **Erişilebilirlik Denetimi** — WCAG AA tam uyum, NVDA/VoiceOver spot kontrolü, Lighthouse ≥ 90
