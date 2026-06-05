# Progress.md — İlerleme ve Karar Kaydı

Yapılan işler, alınan kararlar ve bilinen kısıtlar. En yeni kayıt üstte.

---

## 2026-06-05 — Dokümantasyon mimarisi

**Yapılan:** `prodocs/` klasörü oluşturuldu; PRD, Plan, tech-stack, DesignSystem, Progress, MVP kanonik belgeler olarak eklendi. Kök `README.md`, `.env.example`, `.gitignore` güncellendi.

**Karar:** Demo kapsamı ile üretim fazı `Plan.md` içinde ayrıldı; mock telemetri/anomali üretim maddelerine taşındı.

---

## 2026-06-05 — Anomali severity renkleri

**Yapılan:** `lib/anomaly-severity.ts` — Kritik/Uyarı/Bilgi renk eşlemesi. `AnomaliesPage` ve `TechnicalDashboardPage` güncellendi. Mock veri normalize edildi.

**Hata düzeltildi:** Tüm severity etiketleri `text-energy` (turuncu) ile gösteriliyordu.

---

## 2026-06-05 — UX state'leri

**Yapılan:** `Skeleton` bileşeni; `StrategicDashboardPage`, `TechnicalDashboardPage`, `AnomaliesPage` için loading/empty/error state'leri.

---

## 2026-06-05 — Kural motoru (Rule Engine)

**Yapılan:** `backend/app/api/v1/routes/ai.py` — `_run_rule_engine` (R01–R05), AI özet prompt'una bağlam enjeksiyonu.

**Karar:** Kural motoru yalnızca `/ai/summary` için; rapor ve chat endpoint'lerine henüz eklenmedi.

---

## 2026-06-05 — ESG rapor butonu

**Yapılan:** `ReportsPage` CSV · Profesyonel butonu `secondary` varyantına alındı (gri outline düzeltmesi).

---

## Bilinen kısıtlar (demo)

| Alan | Durum |
|------|--------|
| Telemetri API | Backend `random` simülasyon; TimescaleDB okunmuyor |
| Anomaliler | `mocks/anomalies.ts` |
| MQTT subscriber | Yok; `telemetry-mock.ts` fallback |
| RBAC | Frontend `RoleGate`; backend `require_role` yok |
| AI PDF | `AiReportCard`'da print/PDF butonu yok |
| Kullanıcı seed | README'deki test kullanıcıları; DB seed script yok |
| Font | PRD'de Barlow yazıyor; uygulama DM Sans / DM Mono kullanıyor |

---

## Sıradaki üretim adımları

Öncelik sırası `prodocs/Plan.md` → Kapsam Dışı bölümüne bakın.
