# WEN — Water-Energy Nexus Karar Destek Sistemi

**Teknik Ürün Gereksinim Dokümanı (Technical PRD)**

| Alan | Değer |
|------|--------|
| **Versiyon** | 2.0 (Mühendislik İncelemesi İçin) |
| **Tarih** | Nisan 2026 |
| **Durum** | Hazır / Onay Bekliyor |
| **Sorumlu** | Teknik Product Owner |

---

## 1. Proje Vizyonu ve Mimari Özet

WEN, sanayi tesislerinde su ve enerji verimliliğini optimize etmek için tasarlanmış bir Karar Destek Sistemidir. Sistem, IoT sensör verilerini (MQTT) alır, zaman serisi veritabanında (TimescaleDB) işler ve karar vericilere aksiyon odaklı bir arayüz (React) sunar.

### 1.1. Teknoloji Stack’i

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 18+, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2 |
| **Veri tabanı** | PostgreSQL 15 + TimescaleDB Extension |
| **Mesajlaşma** | Mosquitto MQTT Broker |
| **Raporlama** | WeasyPrint (PDF üretimi için) |

---

## 2. Veritabanı Mimarisi (Entity Relationship & Time-Series)

### 2.1. Telemetri Verisi (TimescaleDB Hypertable)

`telemetry_data` tablosu, her 7 günde bir **chunk** oluşturacak şekilde konfigüre edilir.

| Kolon | Tip | Kısıtlar | Açıklama |
|-------|-----|----------|----------|
| `time` | `TIMESTAMPTZ` | NOT NULL | Veri zaman damgası (zaman serisi indeksi) |
| `sensor_id` | `UUID` | FK → `sensors.id` | Sensörün eşsiz kimliği |
| `water_value` | `DOUBLE` | DEFAULT 0 | m³/saat cinsinden su değeri |
| `energy_value` | `DOUBLE` | DEFAULT 0 | kWh cinsinden enerji değeri |
| `nexus_ratio` | `DOUBLE` | GENERATED | `energy_value / water_value` (anlık oran) |

### 2.2. İlişkisel Tablolar (Standart PostgreSQL)

- **`users`**: `id`, `email`, `password_hash`, `role` (`STRATEGIC` \| `TECHNICAL`), `last_login`
- **`thresholds`**: `id`, `sensor_id`, `user_id`, `min_val`, `max_val`, `alert_type` (`EMAIL` \| `APP`)
- **`crisis_logs`**: `id`, `start_time`, `end_time`, `level` (`YELLOW` \| `ORANGE` \| `RED`), `actor_id`, `resolution_note`

---

## 3. Ekran Detayları ve Kullanıcı Arayüzü (UI)

### 3.1. Dashboard — Stratejik Görünüm (A Tipi)

- **Nexus Health Gauge**: Ekranın sol üstünde, ideal Nexus oranını (0.8–1.2 arası yeşil) gösteren dairesel kadran.
- **Maliyet Öngörü Kartı**: Mevcut tüketimin ay sonu fatura tahminini (BOSB birim fiyatları üzerinden) gösteren finansal özet.
- **Kriz Durum Paneli**: Aktif bir “Kod Kırmızı” protokolü varsa ekranın en üstünde yanıp sönen bir **Action Banner**.

### 3.2. Teknik Analiz Ekranı (B Tipi)

- **Multi-Axis Line Chart**: Aynı grafikte sol Y ekseni Su ($m^3$), sağ Y ekseni Enerji ($kWh$) olacak şekilde 1 dakikalık granularity ile veri gösterimi.
- **Threshold Overlay**: Kullanıcının belirlediği alt/üst sınırlar grafikte yarı saydam kırmızı alanlar olarak render edilir.
- **Raw Data Export**: Seçili tarih aralığındaki verileri `.csv` veya `.parquet` olarak indirme butonu.

---

## 4. API Uç Noktaları (FastAPI Specification)

### 4.1. Telemetri Servisi

| Metot | Uç nokta | Açıklama |
|-------|----------|----------|
| `GET` | `/v1/telemetry/live` | En son gelen 10 veri paketini döner (polling veya WebSocket). |
| `GET` | `/v1/telemetry/history?start_date&end_date&aggregation=1h` | Trend analizi için saatlik ortalamaları döner. |

### 4.2. Anomali ve Kriz Yönetimi

| Metot | Uç nokta | Açıklama |
|-------|----------|----------|
| `POST` | `/v1/thresholds` | Yeni bir alarm eşiği tanımlar. |
| `POST` | `/v1/crisis/escalate` | Kriz seviyesini manuel olarak yükseltir ve protokol adımlarını (JSON) kilitler. |

---

## 5. İş Kuralları ve Algoritmalar

### 5.1. Nexus Oranı Algoritması

Sistem, her sensör paketinde şu formülü çalıştırır:

$$
Nexus\_Ratio = \frac{Current\_Energy\_Consumption}{Current\_Water\_Consumption}
$$

Su tüketimi 0 ise, sistem Infinity dönmemek için **null** değerini ve bir uyarı flag’ini tetikler.

### 5.2. Akıllı Özet (Smart Summary) Mantığı

Basit bir kural motoru (Rule Engine) ile:

| Durum | Sonuç |
|-------|--------|
| Enerji tüketimi > eşik üst sınırı **ve** su tüketimi < eşik alt sınırı | *“Sistemde mekanik bir sürtünme veya pompa arızası olabilir. Su akışı azalırken enerji sarfiyatı artıyor.”* mesajı üretilir. |

---

## 6. Fonksiyonel Olmayan Gereksinimler (NFR)

| Alan | Gereksinim |
|------|------------|
| **Performans** | API yanıt süresi 500 ms altında olmalıdır. |
| **Güvenlik** | Tüm şifreler Argon2id ile hash’lenmelidir. JWT token ömrü 1 saat ile sınırlandırılmalıdır. |
| **Hata yönetimi** | MQTT bağlantısı koptuğunda sistem son 1 saatlik veriyi önbellekten (Redis) sunmalı ve bir “Data Offline” uyarısı vermelidir. |

---

## 7. Kabul Kriterleri (Definition of Done)

- [ ] Bursa OSB (BOSB) pilot tesisi için simülasyon verileri başarıyla üretiliyor mu?
- [ ] Kod Kırmızı protokolü devreye girdiğinde ilgili personele e-posta gidiyor mu?
- [ ] PDF formatındaki ESG Raporu, Yeşil Mutabakat standartlarına uygun veriyi içeriyor mu?

erDiagram

    users {
        uuid id PK "gen_random_uuid()"
        text email UK "NOT NULL"
        text password_hash "NOT NULL — Argon2id"
        text role "CHECK: STRATEGIC | TECHNICAL"
        text name "NOT NULL"
        text department
        text phone
        timestamptz last_login
        int login_count "DEFAULT 0"
        timestamptz created_at "DEFAULT now()"
    }

    factories {
        text id PK "örn: tekstil-a"
        text name "NOT NULL"
        text status "CHECK: Online | Offline | Warning"
        float8 nexus_ratio "DEFAULT 1.0"
        float8 energy_consumption "kWh"
        float8 water_consumption "m3"
        timestamptz updated_at "DEFAULT now()"
    }

    sensors {
        uuid id PK "gen_random_uuid()"
        text factory_id FK "→ factories.id"
        text sensor_type "CHECK: ENERGY | WATER | COMBINED"
        text label
        bool is_active "DEFAULT true"
        timestamptz created_at "DEFAULT now()"
    }

    telemetry_data {
        timestamptz time PK "NOT NULL — TimescaleDB partition key"
        uuid sensor_id PK "FK → sensors.id"
        float8 water_value "m3/h — DEFAULT 0"
        float8 energy_value "kWh — DEFAULT 0"
        float8 nexus_ratio "GENERATED: energy/water — null if water=0"
        bool anomaly_flag "DEFAULT false"
    }

    thresholds {
        uuid id PK "gen_random_uuid()"
        text factory_id FK "→ factories.id"
        uuid created_by FK "→ users.id"
        float8 energy_min "DEFAULT 8.4"
        float8 energy_max "DEFAULT 18.25"
        float8 water_min "DEFAULT 8.08"
        float8 water_max "DEFAULT 12.92"
        text alert_type "CHECK: APP | EMAIL | BOTH"
        bool is_active "DEFAULT true"
        timestamptz created_at "DEFAULT now()"
        timestamptz updated_at "DEFAULT now()"
    }

    anomalies {
        uuid id PK "gen_random_uuid()"
        text anomaly_code UK "örn: ANM-TEK-921"
        text factory_id FK "→ factories.id"
        uuid sensor_id FK "→ sensors.id — nullable"
        text severity "CHECK: Kritik | Turuncu | Sari | Yesil | Uyari"
        text summary "NOT NULL"
        bool is_resolved "DEFAULT false"
        timestamptz resolved_at
        timestamptz created_at "DEFAULT now()"
    }

    crisis_events {
        uuid id PK "gen_random_uuid()"
        uuid actor_id FK "→ users.id"
        text level "CHECK: yellow | orange | red | KOD_KIRMIZI | WATER_CUTOFF"
        bool manual_lock "DEFAULT false"
        bool is_simulation "DEFAULT false"
        text resolution_note
        timestamptz started_at "DEFAULT now()"
        timestamptz resolved_at
    }

    crisis_audit_logs {
        uuid id PK "gen_random_uuid()"
        uuid crisis_event_id FK "→ crisis_events.id"
        uuid user_id FK "→ users.id"
        text step_id "örn: orange-step-1"
        text message "NOT NULL"
        text level_snapshot "seviye anlık değeri"
        timestamptz ts "DEFAULT now()"
    }

    simulation_runs {
        uuid id PK "gen_random_uuid()"
        uuid triggered_by FK "→ users.id"
        text scenario_key "örn: high_water | low_energy | nexus_spike"
        text status "CHECK: running | completed | aborted"
        jsonb result_snapshot "simülasyon sonu anlık veri"
        timestamptz started_at "DEFAULT now()"
        timestamptz ended_at
    }

    notifications {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "→ users.id"
        text title "NOT NULL"
        text body
        text type "CHECK: crisis | simulation | anomaly | system"
        bool is_read "DEFAULT false"
        timestamptz created_at "DEFAULT now()"
    }

    refresh_tokens {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "→ users.id"
        text token_hash UK "NOT NULL"
        timestamptz expires_at "NOT NULL"
        bool revoked "DEFAULT false"
        timestamptz created_at "DEFAULT now()"
    }

    users ||--o{ thresholds : "oluşturur"
    users ||--o{ crisis_events : "tetikler"
    users ||--o{ crisis_audit_logs : "yazar"
    users ||--o{ simulation_runs : "başlatır"
    users ||--o{ notifications : "alır"
    users ||--o{ refresh_tokens : "sahiptir"

    factories ||--o{ sensors : "içerir"
    factories ||--o{ thresholds : "için tanımlı"
    factories ||--o{ anomalies : "üretir"

    sensors ||--o{ telemetry_data : "üretir"
    sensors ||--o{ anomalies : "ilişkili"

    crisis_events ||--o{ crisis_audit_logs : "içerir"