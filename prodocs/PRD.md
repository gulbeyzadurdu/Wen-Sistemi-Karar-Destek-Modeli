# WEN — Water-Energy Nexus Karar Destek Sistemi

**Ürün Gereksinim Dokümanı (PRD)**

| Alan | Değer |
|------|--------|
| **Versiyon** | 2.0 |
| **Tarih** | Nisan 2026 |
| **Durum** | Demo/MVP aktif |

---

## 1. Çözülen Problem

BOSB (Bursa Organize Sanayi Bölgesi) pilot tesislerinde su ve enerji tüketimi ayrı sistemlerde izlenir; operatör ile yönetici arasında **bilgi–eylem boşluğu** oluşur. WEN, IoT telemetrisini tek panelde birleştirir, Nexus oranını (Rn = enerji / su) hesaplar ve kriz anında protokol odaklı müdahale sunar.

## 2. Hedef Kullanıcılar

| Persona | Rol | İhtiyaç |
|---------|-----|---------|
| **Stratejik Karar Verici** | `STRATEGIC` | Özet KPI, maliyet öngörüsü, ESG raporu, AI analizi |
| **Teknik Operatör** | `TECHNICAL` | Canlı grafik, eşik yönetimi, anomali günlüğü, ham veri dışa aktarımı |

## 3. Temel Özellikler (MVP)

### 3.1 Stratejik Panel
- Nexus Sağlık Göstergesi (ideal bant: 0.8–1.2)
- Maliyet ve karbon ayak izi tahmini
- 6 aylık enerji/su trend grafiği
- AI anlık özet ve faaliyet raporu (haftalık/aylık)
- Kriz Action Banner

### 3.2 Operasyon Paneli
- Çok eksenli canlı grafik (su + enerji)
- Eşik overlay (threshold)
- Sensör spark-line kartları
- Son MQTT paketleri tablosu
- Anomali akışı

### 3.3 Kriz ve Simülasyon
- Sarı → Turuncu → Kod Kırmızı / Acil Su Kesintisi protokolü
- Adım adım kontrol listesi ve audit kaydı
- Simülasyon merkezi (yüksek su, enerji dalgalanması vb.)

### 3.4 AI ve Raporlama
- `GET /v1/ai/summary` — anlık telemetri özeti
- `GET /v1/ai/report` — kamu kurumu formatında faaliyet raporu
- `POST /v1/ai/chat` — bağlam-duyarlı sohbet
- Kural motoru (R01–R05) → AI prompt bağlamı
- CSV dışa aktarım (ESG + ham telemetri)

## 4. İş Kuralları

**Nexus Oranı:** `Rn = energy_kwh / water_m3` — su = 0 ise null + uyarı flag.

| Kural | Koşul | Açıklama |
|-------|-------|----------|
| R01 | energy > 16 ve water < 9 | Pompa/mekanik arıza riski |
| R02 | Rn > 1.5 | Kritik verimsizlik |
| R03 | Rn < 0.5 | Aşırı su veya enerji kaybı |
| R04 | anomaly + Rn > 1.2 | Acil teknik müdahale |
| R05 | water = 0 | Sensör arızası veya su kesintisi |

## 5. API Özeti

| Metot | Uç nokta | Açıklama |
|-------|----------|----------|
| POST | `/v1/auth/login` | JWT oturum |
| GET | `/v1/telemetry/live` | Anlık paket |
| GET | `/v1/telemetry/history` | Zaman serisi |
| PUT | `/v1/crisis/audit` | Protokol adımı kaydı |
| GET | `/v1/ai/summary` | AI özet |
| GET | `/v1/ai/report` | AI rapor |
| POST | `/v1/ai/chat` | AI sohbet |

## 6. Fonksiyonel Olmayan Gereksinimler

- API yanıt < 500 ms (hedef)
- Argon2id + JWT (1 saat)
- MQTT kopunca Redis önbellek + Data Offline uyarısı (üretim fazı)
- WCAG AA erişilebilirlik (üretim fazı)

## 7. Kabul Kriterleri (Üretim)

- [ ] BOSB pilot simülasyonu gerçek MQTT ile besleniyor
- [ ] Kod Kırmızı tetiklenince e-posta bildirimi gidiyor
- [ ] PDF ESG raporu Yeşil Mutabakat uyumlu

> Detaylı şema ve ER diyagramı için kök `prd.md` (teknik genişletme) veya `backend/app/models/` kaynak koduna bakın.
