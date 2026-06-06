# WEN Frontend — Su–Enerji Nexus Karar Destek Paneli

React 19 + TypeScript + Vite tabanlı, tamamen **mock veri** ile çalışan endüstriyel karar destek arayüzü. Backend bağımsız çalışır; bir tester'ın denemesi için yalnızca Node.js yeterlidir.

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda: **http://localhost:5173**

## Demo Hesapları

| Rol | E-posta | Şifre |
|---|---|---|
| **Stratejik (Yönetici)** | `arif@bosb.gov.tr` | `admin` |
| **Teknik (Operasyon)** | `emre@bosb.gov.tr` | `admin` |

Mock JWT `localStorage` (`wen-auth`) içinde tutulur; çıkış için `/settings → Oturumu kapat`.

## Roller ve Erişebilen Sayfalar

| Yol | Stratejik | Teknik | Açıklama |
|---|---|---|---|
| `/dashboard-strategic` | ✓ | — | KPI kartları, Nexus Gauge, Enerji & Su trendi, AI Analiz & Rapor |
| `/analysis` | ✓ | — | Uzun aralıklı trend grafiği |
| `/reports` | ✓ | — | CSV / Excel / mock PDF dışa aktarım |
| `/notifications` | ✓ | — | Mock bildirim akışı |
| `/dashboard-technical` | — | ✓ | MQTT canlı çoklu eksen, eşikler, sensörler |
| `/historical` | — | ✓ | Ham telemetri CSV indirme |
| `/anomalies` | — | ✓ | Olay günlükleri |
| `/crisis` | ✓ | ✓ | Sarı / Turuncu / Kod Kırmızı protokolü + alarm sesi |
| `/simulations` | ✓ | ✓ | Senaryo tetikleme merkezi |
| `/settings` | ✓ | ✓ | Eşikler, tema, bildirim, MQTT simülasyonu |

## Komutlar

```bash
npm run dev       # Vite dev sunucusu (port 5173)
npm run build     # tsc -b && vite build
npm run preview   # Build çıktısını önizle
npm run lint      # ESLint
```

## Klasör Yapısı

```
src/
├── App.tsx                      # Route tanımları + RBAC korumalı layout
├── main.tsx                     # QueryClient + ThemeSync + BrowserRouter
├── index.css                    # NEXUS DS v1.0.0 tasarım token'ları
├── nav-config.ts                # Role göre menü çözümleyici
├── components/
│   ├── ai/                      # AiSummaryCard, AiReportCard
│   ├── auth/                    # RequireAuth, RoleGate
│   ├── charts/                  # NexusGauge, StrategicTrendChart, TechnicalLiveChart
│   ├── chat/                    # ChatBot (bağlam-duyarlı AI asistan)
│   ├── crisis/                  # ProtocolChecklist (sıralı/serbest)
│   ├── factories/               # FactorySelector
│   ├── iot/                     # IoTGatewayPanel
│   ├── layout/                  # AppShell, GlobalHeader, SideNav, MobileNav, CrisisStrip, WeatherWidget, DataOfflineBanner
│   ├── reports/                 # PDFReportExporter (mock WeasyPrint)
│   ├── strategic/               # CrisisActionBanner
│   ├── theme/                   # ThemeSync (data-theme = dark/light)
│   └── ui/                      # button (shadcn varyantları)
├── hooks/
│   ├── useLiveTelemetry.ts      # TanStack Query polling 12 sn
│   ├── useNexus.ts              # Rₙ hesaplama + tier
│   └── useAnomalies.ts
├── lib/
│   ├── alarm.ts                 # Web Audio API alarm sentezleyici
│   ├── api-client.ts            # Backend REST istemcisi (AI dahil)
│   ├── audit-client.ts          # Crisis adımı için mock PUT
│   ├── data-exporter.ts         # CSV / Excel uyumlu dışa aktarım
│   ├── telemetry-mock.ts        # Mock MQTT simülatörü
│   └── utils.ts                 # cn (twMerge + clsx)
├── mocks/                       # FACTORIES, FACTORY_ANOMALY_HISTORY
├── pages/                       # 12 ekran (yukarıdaki tabloya bakın)
├── providers/                   # CrisisProvider (debounce dahil), ProtectedLayout
├── stores/                      # auth, crisis, ops, threshold, theme, connection (Zustand + persist)
└── types/                       # UserRole, CrisisLevelUI, NexusTier
```

## AI Modülü

Backend bağlıyken ve `OPENROUTER_API_KEY` tanımlıyken aşağıdaki özellikler etkinleşir:

| Bileşen | Açıklama |
|---|---|
| `AiSummaryCard` | Anlık telemetri verisiyle AI değerlendirmesi ve aksiyon önerisi |
| `AiReportCard` | Haftalık/aylık kamu kurumu formatında dönemsel faaliyet raporu |
| `ChatBot` | Anlık Nexus oranı, kriz seviyesi ve trend verisini okuyabilen sohbet asistanı |

Chatbot her mesajda anlık dashboard bağlamını (enerji, su, Rₙ, kriz seviyesi, trend) OpenRouter'a iletir.

## Kriz Debounce Mantığı

`CrisisProvider` telemetri tier'ını **4 ardışık pakette** (~48 saniye) anormal görürse kriz seviyesini yükseltir. Anlık spike'lar (1-3 paket) uyarı/alarm tetiklemez. Normale döndüğünde kriz hemen sıfırlanır.

## Nexus Eşik Mantığı

Sistem `Rₙ = Eₜ / Wₜ` (kWh / m³) hesaplar:

| Bant | Aralık | Durum |
|---|---|---|
| Normal | `0.8 ≤ Rₙ ≤ 1.2` | Yeşil |
| Uyarı | `1.2 < Rₙ ≤ 1.5` | Sarı (Gözlem) |
| Alarm | `Rₙ > 1.5` | Turuncu (Hazırlık) |
| Kritik | Manuel + eşik aşımı | Kırmızı (Kod Kırmızı) |

## Teknoloji

- **React 19**, **Vite 8**, **TypeScript ~6**
- **Tailwind CSS 3.4** + tasarım token'ları (`--bg-base`, `--blue`, `--energy`, vb.)
- **Zustand** (persist middleware) — auth/crisis/ops/threshold/theme/connection store'ları
- **TanStack Query 5** — telemetri/anomali polling
- **Recharts** — çok eksenli grafikler
- **lucide-react** — ikonlar
- **react-router-dom 7** — RBAC korumalı route'lar
- **Web Audio API** — dış dosya gerektirmeyen alarm sesi sentezi
