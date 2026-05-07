# WEN Frontend — Su–Enerji Nexus Karar Destek Paneli

React 19 + TypeScript + Vite tabanlı, tamamen **mock veri** ile çalışan endüstriyel karar destek arayüzü. Backend bağımsız çalışır; bir tester'ın denemesi için yalnızca Node.js yeterlidir.

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda: **http://localhost:5173**

## Demo Hesapları

Giriş ekranında bu hesaplardan birini kullanın:

| Rol | Kullanıcı Adı | Şifre |
|---|---|---|
| **Stratejik (Yönetici)** | `admin@bosb.gov.tr` | `admin` |
| **Teknik (Operasyon)** | `operator@bosb.gov.tr` | `operator` |

Mock JWT `localStorage` (`wen-auth`) içinde tutulur; çıkış için `/settings → Oturumu kapat`.

## Roller ve Erişebilen Sayfalar

| Yol | Stratejik | Teknik | Açıklama |
|---|---|---|---|
| `/dashboard-strategic` | ✓ | — | KPI kartları, Nexus Gauge, ESG trend |
| `/analysis` | ✓ | — | Uzun aralıklı trend grafiği |
| `/reports` | ✓ | — | CSV / Excel / mock PDF dışa aktarım |
| `/notifications` | ✓ | — | Mock bildirim akışı |
| `/dashboard-technical` | — | ✓ | MQTT canlı çoklu eksen, eşikler, sensörler |
| `/historical` | — | ✓ | Ham telemetri CSV indirme |
| `/anomalies` | — | ✓ | Olay günlükleri |
| `/crisis` | ✓ | ✓ | Sarı / Turuncu / Kod Kırmızı protokolü |
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
│   ├── auth/                    # RequireAuth, RoleGate
│   ├── charts/                  # NexusGauge, StrategicTrendChart, TechnicalLiveChart
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
│   ├── audit-client.ts          # Crisis adımı için mock PUT
│   ├── data-exporter.ts         # CSV / Excel uyumlu dışa aktarım
│   ├── telemetry-mock.ts        # Mock MQTT simülatörü
│   └── utils.ts                 # cn (twMerge + clsx)
├── mocks/                       # FACTORIES, FACTORY_ANOMALY_HISTORY
├── pages/                       # 12 ekran (yukarıdaki tabloya bakın)
├── providers/                   # CrisisProvider, ProtectedLayout
├── stores/                      # auth, crisis, ops, threshold, theme, connection (Zustand + persist)
└── types/                       # UserRole, CrisisLevelUI, NexusTier
```

## Nexus Eşik Mantığı

Sistem `Rₙ = Eₜ / Wₜ` (kWh / m³) hesaplar:

| Bant | Aralık | Tema |
|---|---|---|
| Normal | `0.8 ≤ Rₙ ≤ 1.2` | Yeşil |
| Uyarı | `1.2 < Rₙ ≤ 1.5` | Sarı (Gözlem) |
| Alarm | `Rₙ > 1.5` | Turuncu (Hazırlık) |
| Kritik | Manuel + eşik aşımı | Kırmızı (Kod Kırmızı) |

`/simulations` ekranındaki "KOD KIRMIZI" ve "Acil Su Kesintisi" düğmeleri manuel kilit oluşturur (`/crisis → Olay çözümü` ile temizlenene kadar).

## Teknoloji

- **React 19**, **Vite 8**, **TypeScript ~6**
- **Tailwind CSS 3.4** + tasarım token'ları (`--bg-base`, `--blue`, `--energy`, vb.)
- **Zustand** (persist middleware) — auth/crisis/ops/threshold/theme/connection store'ları
- **TanStack Query 5** — telemetri/anomali polling
- **Recharts** — çok eksenli grafikler
- **lucide-react** — ikonlar
- **react-router-dom 7** — RBAC korumalı route'lar
