  WEN — Profil Sekmesi User Flow @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'); \*, \*::before, \*::after { box-sizing: border-box; margin: 0; padding: 0; } :root { --bg: #080c14; --glass: rgba(255,255,255,0.05); --glass-hover: rgba(255,255,255,0.09); --border: rgba(255,255,255,0.09); --border-mid: rgba(255,255,255,0.16); --water: #00d4ff; --water-soft: rgba(0,212,255,0.13); --solar: #a78bfa; --solar-soft: rgba(167,139,250,0.13); --energy: #ff8c42; --ok: #00e5a0; --ok-soft: rgba(0,229,160,0.12); --warn: #ffd166; --red: #ff4757; --red-soft: rgba(255,71,87,0.10); --slate: #6b7a99; --white: #f0f4ff; --silver: #94a3b8; } body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--white); min-height: 100vh; padding: 40px 24px 80px; } /\* Ambient background \*/ body::before { content: ''; position: fixed; top: -20%; left: 10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%); pointer-events: none; z-index: 0; } body::after { content: ''; position: fixed; bottom: 10%; right: 5%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%); pointer-events: none; z-index: 0; } .container { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; } /\* Header \*/ .page-header { margin-bottom: 48px; } .page-header .eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--slate); margin-bottom: 8px; } .page-header h1 { font-size: 28px; font-weight: 600; margin-bottom: 6px; } .page-header p { font-size: 14px; color: var(--slate); } /\* Role toggle \*/ .role-toggle { display: flex; gap: 8px; margin-bottom: 40px; } .role-btn { padding: 8px 20px; border-radius: 999px; border: 1px solid var(--border-mid); background: var(--glass); color: var(--slate); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s; backdrop-filter: blur(12px); } .role-btn.active-strategic { background: var(--solar-soft); border-color: rgba(167,139,250,0.35); color: var(--solar); } .role-btn.active-technical { background: var(--water-soft); border-color: rgba(0,212,255,0.35); color: var(--water); } .role-btn:not(.active-strategic):not(.active-technical):hover { background: var(--glass-hover); color: var(--white); } /\* Section label \*/ .section-label { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--slate); margin-bottom: 12px; padding-left: 4px; } /\* Glass card \*/ .glass-card { background: var(--glass); backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%); border: 1px solid var(--border-mid); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06); } /\* Entry point \*/ .entry-point { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: 999px; border: 1px dashed rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); margin-bottom: 10px; font-size: 13px; color: var(--silver); width: fit-content; } .entry-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ok); box-shadow: 0 0 8px var(--ok); animation: pulse 2s infinite; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } /\* Arrow connector \*/ .arrow { display: flex; align-items: center; justify-content: center; height: 28px; color: var(--slate); font-size: 18px; margin: 2px 0 2px 24px; } /\* Profile card (simulated) \*/ .profile-hero { padding: 28px; margin-bottom: 10px; display: flex; align-items: center; gap: 20px; position: relative; overflow: hidden; } .profile-hero::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; filter: blur(60px); opacity: 0.18; pointer-events: none; } .strategic .profile-hero::before { background: var(--solar); } .technical .profile-hero::before { background: var(--water); } .avatar { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; color: white; flex-shrink: 0; } .strategic .avatar { background: linear-gradient(135deg, var(--solar), var(--energy)); } .technical .avatar { background: linear-gradient(135deg, var(--water), #33ddff); } .profile-info { flex: 1; } .greeting { font-size: 12px; color: var(--slate); margin-bottom: 3px; } .profile-name { font-size: 22px; font-weight: 600; margin-bottom: 8px; } .role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; } .strategic .role-badge { background: var(--solar-soft); color: var(--solar); } .technical .role-badge { background: var(--water-soft); color: var(--water); } .profile-meta { margin-left: auto; text-align: right; } .meta-label { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate); margin-bottom: 4px; } .meta-value { font-size: 13px; color: var(--silver); } /\* Tab bar \*/ .tab-bar { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 0; padding: 0 28px; background: rgba(255,255,255,0.02); border-radius: 0 0 0 0; } .tab-item { padding: 14px 16px; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; white-space: nowrap; } .tab-item:hover { color: var(--white); } .tab-item.active { color: var(--white); } .strategic .tab-item.active { border-bottom-color: var(--solar); } .technical .tab-item.active { border-bottom-color: var(--water); } /\* Tab content panels \*/ .tab-panels { display: none; } .tab-panels.active { display: block; } .tab-content { padding: 24px 28px; } /\* Info grid \*/ .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; } .info-field { padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; } .field-label { font-size: 10px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate); margin-bottom: 5px; } .field-value { font-size: 14px; color: var(--white); } .field-value.editable { border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 2px; } .field-value.readonly { color: var(--silver); font-style: italic; } .edit-note { font-size: 10px; color: var(--slate); margin-top: 3px; } .save-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; } .strategic .save-btn { background: var(--solar-soft); color: var(--solar); border: 1px solid rgba(167,139,250,0.25); } .technical .save-btn { background: var(--water-soft); color: var(--water); border: 1px solid rgba(0,212,255,0.25); } /\* Activity \*/ .activity-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; } .stat-card { padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; text-align: center; } .stat-value { font-size: 22px; font-weight: 600; margin-bottom: 4px; } .stat-label { font-size: 11px; color: var(--slate); } .strategic .stat-value { color: var(--solar); } .technical .stat-value { color: var(--water); } .activity-log { display: flex; flex-direction: column; gap: 8px; } .log-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; font-size: 12px; } .log-time { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--slate); width: 80px; flex-shrink: 0; } .log-badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 500; flex-shrink: 0; } .badge-crisis { background: var(--red-soft); color: var(--red); } .badge-sim { background: rgba(255,140,66,0.12); color: var(--energy); } .badge-system { background: var(--ok-soft); color: var(--ok); } .badge-anomaly { background: rgba(255,209,102,0.12); color: var(--warn); } .log-text { color: var(--silver); flex: 1; } /\* Permissions \*/ .perm-grid { display: flex; flex-direction: column; gap: 6px; } .perm-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; } .perm-name { color: var(--silver); } .perm-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; } .perm-ok { background: var(--ok-soft); color: var(--ok); } .perm-no { background: var(--red-soft); color: var(--red); } .perm-ro { background: rgba(255,209,102,0.1); color: var(--warn); } .perm-note { margin-top: 14px; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; font-size: 11px; color: var(--slate); } /\* Security \*/ .security-grid { display: flex; flex-direction: column; gap: 12px; } .security-card { padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px; } .security-card h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; } .password-fields { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; } .fake-input { padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-mid); border-radius: 8px; font-size: 13px; color: var(--slate); font-family: 'DM Sans', sans-serif; } .fake-input.filled { color: var(--silver); } .validation-ok { font-size: 11px; color: var(--ok); display: flex; align-items: center; gap: 4px; } .session-info { display: flex; flex-direction: column; gap: 6px; } .session-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); } .session-row:last-child { border-bottom: none; } .session-key { color: var(--slate); } .session-val { color: var(--silver); font-family: 'DM Mono', monospace; font-size: 11px; } .tfa-row { display: flex; align-items: center; justify-content: space-between; } .tfa-status { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--silver); } .tfa-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); } .tfa-btn { padding: 7px 16px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-mid); color: var(--silver); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; } /\* Flow connector line \*/ .flow-line { width: 2px; background: linear-gradient(to bottom, transparent, var(--border-mid), transparent); height: 20px; margin: 0 auto 0 35px; } /\* Notification toast (simulation) \*/ .toast { position: fixed; bottom: 32px; right: 32px; padding: 14px 18px; background: rgba(0,229,160,0.12); border: 1px solid rgba(0,229,160,0.25); border-radius: 12px; backdrop-filter: blur(20px); font-size: 13px; color: var(--ok); display: flex; align-items: center; gap: 8px; transform: translateY(80px); opacity: 0; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); z-index: 100; pointer-events: none; } .toast.show { transform: translateY(0); opacity: 1; } /\* Scroll hint \*/ .scroll-hint { text-align: center; font-size: 11px; color: var(--slate); margin-top: 40px; font-family: 'DM Mono', monospace; letter-spacing: 0.1em; } /\* Responsive \*/ @media (max-width: 640px) { .info-grid { grid-template-columns: 1fr; } .activity-stats { grid-template-columns: 1fr 1fr; } .profile-meta { display: none; } .tab-item { padding: 12px 10px; font-size: 12px; } } /\* Wrapped card for flow \*/ .flow-section { margin-bottom: 6px; } .flow-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; } .flow-number { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; flex-shrink: 0; } .strategic .flow-number { background: var(--solar-soft); color: var(--solar); } .technical .flow-number { background: var(--water-soft); color: var(--water); } .flow-title { font-size: 13px; color: var(--slate); font-weight: 500; } /\* Tab bar wrapper for glass \*/ .profile-card-wrapper { border-radius: 16px; overflow: hidden; border: 1px solid var(--border-mid); box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06); background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); } .hidden-role { display: none; }

WEN Nexus · Profil Sekmesi

User Flow Diyagramı
===================

Her iki kullanıcı rolü için profil sekmesinin ekran akışı ve içerik yapısı

◆ Stratejik Yönetici ⬡ Teknik Operatör

→

Giriş noktası — Header'daki isime tıklanır, dropdown açılır, "Profil" seçilir

Sağ üstteki **Arif Yılmaz ▾** → Profil

↓

1

Karşılama alanı — sayfa açılır

AY

Merhaba,

Arif Yılmaz

◆ Stratejik Yönetici   Strateji ve Planlama

Son giriş

25 Mayıs, 14:32

Toplam oturum: 47

Genel Bilgiler

Aktivite

Yetkiler

Güvenlik

Kullanıcı ID

usr\_a81f2c · kopyala

Görev

Yönetici

Ad Soyad · düzenlenebilir

Arif Yılmaz

Departman · düzenlenebilir

Strateji ve Planlama

E-posta · salt okunur

admin@bosb.gov.tr

Değiştirmek için sistem yöneticisine başvurun.

Telefon · düzenlenebilir

+90 224 000 01

Değişiklikleri Kaydet

3

Aktif Simülasyon

7

Okunmamış Bildirim

12:04

Bu Oturum Süresi

14:31SimülasyonYüksek su tüketimi senaryosu başlatıldı

13:58KrizTuruncu protokol adımları tamamlandı

13:22SistemESG raporu dışa aktarıldı (CSV)

12:45SistemEnerji eşiği 16.0 kWh olarak güncellendi

12:19KrizSarı gözlem seviyesi tetiklendi

Stratejik DashboardTam Erişim

ESG Raporlarıİndir ve Görüntüle

Trend AnaliziTam Erişim

Simülasyon MerkeziTetikleyebilir

Kriz ProtokolüSeviye Yükseltme

Sistem AyarlarıTam Erişim

Ham VeriSalt Okunur

Teknik Operasyon PaneliSalt Okunur

Saha Komut GöndermeYetki Dışı

Yetki değişiklikleri sistem yöneticisi onayı gerektirir. Talep için IT Destek: dahili 0-100

### 🔑 Şifre Değiştirme

Mevcut şifre

••••••••

••••••••

✓ Şifreler eşleşiyor

Son değişiklik: 12 Mart 2026

Şifreyi Güncelle

### 💻 Aktif Oturum

Oturum başlangıcı25 May 2026 · 14:19

TarayıcıChrome 124 · macOS

IP192.168.1.xx (yerel)

Tüm Oturumları Kapat

### 🔐 İki Faktörlü Doğrulama

Henüz aktif değil

Etkinleştir

Etkinleştirmek için sistem yöneticisi onayı gerekir.

→

Giriş noktası — Header'daki isime tıklanır, dropdown açılır, "Profil" seçilir

Sağ üstteki **Emre Demir ▾** → Profil

↓

1

Karşılama alanı — sayfa açılır

ED

Merhaba,

Emre Demir

⬡ Teknik Operatör   Saha Operasyonları

Son giriş

25 Mayıs, 09:04

Toplam oturum: 112

Genel Bilgiler

Aktivite

Yetkiler

Güvenlik

Kullanıcı ID

usr\_b93d7e · kopyala

Görev

Saha Operatörü

Ad Soyad · düzenlenebilir

Emre Demir

Departman · düzenlenebilir

Saha Operasyonları

E-posta · salt okunur

operator@bosb.gov.tr

Değiştirmek için sistem yöneticisine başvurun.

Telefon · düzenlenebilir

+90 224 000 02

Değişiklikleri Kaydet

14

İzlenen Anomali

Normal

Aktif Kriz Seviyesi

4

Bağlı Fabrika

09:52AnomaliANM-921 — Otomotiv-B sensör sapması gözlemlendi

09:38KrizKod Kırmızı protokol — pompa güvenli modda durduruldu

09:10SimülasyonSu kesintisi simülasyonu tamamlandı

08:44SistemHam veri raporu dışa aktarıldı (Excel CSV)

08:31AnomaliTekstil-A su akışı nominal değerin %18 üstünde

Operasyon PaneliTam Erişim

Ham VeriTam Erişim + Dışa Aktar

Anomali İzlemeTam Erişim

Simülasyon MerkeziTetikleyebilir

Kriz ProtokolüChecklist Yürütme

Stratejik DashboardSalt Okunur

ESG RaporlarıSadece Görüntüle

Sistem AyarlarıEşikler Salt Okunur

Kriz Seviyesi YükseltmeYetki Dışı

Yetki değişiklikleri sistem yöneticisi onayı gerektirir. Talep için IT Destek: dahili 0-100

### 🔑 Şifre Değiştirme

Mevcut şifre

Yeni şifre

Yeni şifre tekrar

En az 8 karakter, harf + rakam zorunlu

Son değişiklik: Henüz değiştirilmedi

Şifreyi Güncelle

### 💻 Aktif Oturum

Oturum başlangıcı25 May 2026 · 09:04

TarayıcıFirefox 126 · Windows

IP192.168.1.xx (yerel)

Tüm Oturumları Kapat

### 🔐 İki Faktörlü Doğrulama

Henüz aktif değil

Etkinleştir

Etkinleştirmek için sistem yöneticisi onayı gerekir.

sekmelere tıklayabilirsin · içerikler etkileşimli

✓ İşlem kaydedildi, bildirim paneline düştü

function switchRole(role) { const strategic = document.getElementById('flow-strategic') const technical = document.getElementById('flow-technical') const btnS = document.getElementById('btn-strategic') const btnT = document.getElementById('btn-technical') if (role === 'strategic') { strategic.style.display = 'block' technical.classList.add('hidden-role') btnS.className = 'role-btn active-strategic' btnT.className = 'role-btn' } else { strategic.style.display = 'none' technical.classList.remove('hidden-role') btnT.className = 'role-btn active-technical' btnS.className = 'role-btn' } } function switchTab(el, panelId) { // Deactivate all tabs in same wrapper const tabBar = el.parentElement tabBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active')) el.classList.add('active') // Find all panels in the same profile-card-wrapper const wrapper = tabBar.closest('.profile-card-wrapper') wrapper.querySelectorAll('.tab-panels').forEach(p => p.classList.remove('active')) document.getElementById(panelId).classList.add('active') } let toastTimer function showToast() { const t = document.getElementById('toast') t.classList.add('show') clearTimeout(toastTimer) toastTimer = setTimeout(() => t.classList.remove('show'), 2800) }