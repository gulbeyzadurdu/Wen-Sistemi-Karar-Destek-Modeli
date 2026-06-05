# WEN — MVP Kapsam Dokümanı

| Alan | Değer |
|------|--------|
| **Versiyon** | 1.0 |
| **Tarih** | Nisan 2026 |

## 1. Amaç

BOSB pilot tesisinde su ve enerji verilerini entegre ederek **bilgi–eylem boşluğunu** kapatacak karar destek mekanizması kurmak.

## 2. Personalar

### Stratejik Karar Verici (Fabrika Müdürü / Direktör)
- Özet göstergeler, maliyet öngörüsü, kriz yönetimi
- Rol: `STRATEGIC`

### Teknik Operatör (Çevre Mühendisi / Teknisyen)
- Anlık takip, trend analizi, anomali tespiti
- Rol: `TECHNICAL`

## 3. MVP Özellik Seti (Must-Have)

### Modül 1: Nexus Dashboard
- Anlık su (m³/h) ve enerji (kWh) izleme
- Dinamik Nexus oranı (kWh/m³)
- Rol bazlı görünüm (özet vs. detay)

### Modül 2: Anomali ve Uyarı
- Eşik (threshold) yönetimi
- Push & mail bildirimi *(üretim fazı)*
- Smart Summary / kural motoru *(demo: AI özet + R01–R05)*

### Modül 3: Kod Kırmızı Protokolü
- Sarı → Turuncu → Kırmızı seviyeleri
- Adım adım aksiyon rehberi
- Dijital audit trail

### Modül 4: Simülasyon ve ESG
- BOSB simülasyonu *(demo: mock)*
- ESG çıktısı / PDF *(demo: CSV + AI rapor; WeasyPrint üretim fazı)*

## 4. Teknik Kısıtlar

- MQTT (Mosquitto), TimescaleDB, FastAPI, React/TypeScript
- Docker Compose yerel altyapı

## 5. Başarı KPI'ları (hedef)

- Anomali doğruluğu %85
- Kriz müdahale süresinde %50 iyileşme
- Haftalık aktif kullanım %70

> MVP sonrası özellikler için `Plan.md` → Kapsam Dışı bölümüne bakın.
