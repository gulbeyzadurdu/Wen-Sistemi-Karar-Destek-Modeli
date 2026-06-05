# DesignSystem.md — NEXUS DS v1.0.0

Endüstriyel su–enerji karar destek arayüzü tasarım sistemi. Kaynak: `frontend/src/index.css`, `frontend/tailwind.config.js`, `.cursor/rules/wen-design-system.mdc`.

---

## 1. Tasarım Prensipleri

- **Industrial clarity** — dekorasyon değil, veri öncelikli
- **Real-time awareness** — sistem durumu görünür (badge, alarm, state)
- **Mobile-first** — küçükten büyüğe responsive
- **Domain semantics** — su/enerji/solar renk dili karıştırılmaz
- **Erişilebilirlik** — kritik alanlarda WCAG AA hedefi (üretim denetimi bekliyor)

---

## 2. Renk Paleti

### Marka
| Token | Değer | Kullanım |
|-------|-------|----------|
| `--navy` | `#0a3a6b` | Marka koyu |
| `--blue` | `#0969b0` | Birincil |
| `--blue-light` | `#1a8bdc` | Vurgu, odak |

### Domain (zorunlu eşleme)
| Token | Değer | Kullanım |
|-------|-------|----------|
| `--water` | `#1a8bdc` | Su verisi |
| `--energy` | `#f07c20` | Enerji verisi |
| `--solar` | `#3bcfcf` | Solar / ikincil metrik |

Tailwind: `text-water`, `text-energy`, `text-solar`, `bg-ok-soft`, `text-warn`, `text-destructive`

### Durum
| Token | Kullanım |
|-------|----------|
| `--ok` / `text-ok` | Normal, başarılı |
| `--warn` / `text-warn` | Uyarı |
| `--red` / `text-destructive` | Kritik, hata |

### Yüzey
`--bg-base`, `--bg-card`, `--bg-panel`, `--bg-elevated`, `glass-card` utility sınıfı

---

## 3. Tipografi

| Rol | Font | CSS token |
|-----|------|-----------|
| Display / body | DM Sans | `--font-display`, `--font-body` |
| Mono / etiket | DM Mono | `--font-mono` |

**Etiket stili (sık kullanılan):**
```
font-mono text-[11px] uppercase tracking-[0.45em] text-slate
```

**KPI değerleri:** `.text-data-value` + `clamp()` (`index.css`)

---

## 4. Spacing ve Layout

- 4px taban: `--s1` (4px) … `--s16` (64px)
- Radius: `--r1` … `--r-full`, kartlarda `rounded-xl`
- Breakpoint'ler: XS/SM tek kolon → MD sidebar katlanır → LG+ sabit sidebar (200px) → XL+ opsiyonel sağ panel
- Max içerik: `max-w-content` (~1400px)

---

## 5. Bileşen Kuralları

### Kartlar
- `glass-card`, `glass-card-hover` — panel ve KPI kartları
- Domain top-accent veya ikon rengi ile ayrışma

### Butonlar (`components/ui/button.tsx`)
Varyantlar: `default`, `secondary`, `outline`, `destructive`, `success`, `ghost`
Boyutlar: `sm`, `default`, `lg`, `icon` — minimum dokunma 44px (`default`)

### Durum rozetleri
Anomali severity: `lib/anomaly-severity.ts` — Kritik (kırmızı), Uyarı (sarı), Bilgi (yeşil)

### UX state'leri
- Yükleme: `<Skeleton className="h-* w-full" />`
- Hata: `glass-card` + `text-destructive` / `text-warn` ikon + mesaj
- Boş: `glass-card` + ikon + başlık + `text-slate` açıklama

### Grafikler
- Su ekseni: `--water`, enerji: `--energy`
- Boş veri: açık empty-state mesajı
- `prefers-reduced-motion` desteği hedeflenir

---

## 6. Erişilebilirlik (hedef)

- Interaktif öğelerde `aria-label` veya görünür label
- Form: `label[for]` + `input[id]`
- Modal: focus trap, ESC, `aria-modal`
- Durum değişimi: `aria-live="polite"` (gerektiğinde)
- Minimum dokunma: 44×44px

---

## 7. Do / Don't

**Do:** Token tabanlı stil, domain renk semantiği, tutarlı KPI/alarm dili  
**Don't:** Rastgele hex, inline style, enerji verisini water rengiyle gösterme
