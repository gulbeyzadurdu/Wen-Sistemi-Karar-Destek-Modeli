import { Check, Copy, Lock, LogOut, Shield, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAnomalies } from '@/hooks/useAnomalies'
import { useDateFormat } from '@/hooks/useDateFormat'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useAuthStore } from '@/stores/auth-store'
import { useConnectionStore } from '@/stores/connection-store'
import { useCrisisStore } from '@/stores/crisis-store'

// ─── Role-specific mock data ────────────────────────────────────────────────

type BadgeType = 'crisis' | 'sim' | 'system' | 'anomaly'
type PermLevel = 'full' | 'exec' | 'read' | 'none'

interface ActivityStat { value: string; label: string }
interface ActivityLog { time: string; badge: BadgeType; badgeLabel: string; text: string }
interface Permission { name: string; level: PermLevel; note?: string }

const STRATEGIC_DATA = {
  id: 'usr_a81f2c',
  job: 'Yönetici',
  email: 'admin@bosb.gov.tr',
  phone: '+90 224 000 01',
  department: 'Strateji ve Planlama',
  lastLogin: '25 Mayıs, 14:32',
  totalSessions: 47,
  sessionStart: '25 May 2026 · 14:19',
  browser: 'Chrome 124 · macOS',
  lastPasswordChange: '12 Mart 2026',
  activityLog: [
    { time: '14:31', badge: 'sim' as BadgeType, badgeLabel: 'Simülasyon', text: 'Yüksek su tüketimi senaryosu başlatıldı' },
    { time: '13:58', badge: 'crisis' as BadgeType, badgeLabel: 'Kriz', text: 'Turuncu protokol adımları tamamlandı' },
    { time: '13:22', badge: 'system' as BadgeType, badgeLabel: 'Sistem', text: 'ESG raporu dışa aktarıldı (CSV)' },
    { time: '12:45', badge: 'system' as BadgeType, badgeLabel: 'Sistem', text: 'Enerji eşiği 16.0 kWh olarak güncellendi' },
    { time: '12:19', badge: 'crisis' as BadgeType, badgeLabel: 'Kriz', text: 'Sarı gözlem seviyesi tetiklendi' },
  ] as ActivityLog[],
  permissions: [
    { name: 'Stratejik Panel', level: 'full' as PermLevel },
    { name: 'ESG Raporları', level: 'read' as PermLevel, note: 'İndir ve Görüntüle' },
    { name: 'Trend Analizi', level: 'full' as PermLevel },
    { name: 'Simülasyon Merkezi', level: 'exec' as PermLevel, note: 'Tetikleyebilir' },
    { name: 'Kriz Protokolü', level: 'exec' as PermLevel, note: 'Seviye Yükseltme' },
    { name: 'Sistem Ayarları', level: 'full' as PermLevel },
    { name: 'Ham Veri', level: 'read' as PermLevel, note: 'Salt Okunur' },
    { name: 'Teknik Operasyon Paneli', level: 'read' as PermLevel, note: 'Salt Okunur' },
    { name: 'Saha Komut Gönderme', level: 'none' as PermLevel },
  ] as Permission[],
}

const TECHNICAL_DATA = {
  id: 'usr_b93d7e',
  job: 'Saha Operatörü',
  email: 'operator@bosb.gov.tr',
  phone: '+90 224 000 02',
  department: 'Saha Operasyonları',
  lastLogin: '25 Mayıs, 09:04',
  totalSessions: 112,
  sessionStart: '25 May 2026 · 09:04',
  browser: 'Firefox 126 · Windows',
  lastPasswordChange: 'Henüz değiştirilmedi',
  activityLog: [
    { time: '09:52', badge: 'anomaly' as BadgeType, badgeLabel: 'Anomali', text: 'ANM-921 — Otomotiv-B sensör sapması gözlemlendi' },
    { time: '09:38', badge: 'crisis' as BadgeType, badgeLabel: 'Kriz', text: 'Kod Kırmızı protokol — pompa güvenli modda durduruldu' },
    { time: '09:10', badge: 'sim' as BadgeType, badgeLabel: 'Simülasyon', text: 'Su kesintisi simülasyonu tamamlandı' },
    { time: '08:44', badge: 'system' as BadgeType, badgeLabel: 'Sistem', text: 'Ham veri raporu dışa aktarıldı (Excel CSV)' },
    { time: '08:31', badge: 'anomaly' as BadgeType, badgeLabel: 'Anomali', text: 'Tekstil-A su akışı nominal değerin %18 üstünde' },
  ] as ActivityLog[],
  permissions: [
    { name: 'Operasyon Paneli', level: 'full' as PermLevel },
    { name: 'Ham Veri', level: 'full' as PermLevel, note: 'Tam Erişim + Dışa Aktar' },
    { name: 'Anomali İzleme', level: 'full' as PermLevel },
    { name: 'Simülasyon Merkezi', level: 'exec' as PermLevel, note: 'Tetikleyebilir' },
    { name: 'Kriz Protokolü', level: 'exec' as PermLevel, note: 'Checklist Yürütme' },
    { name: 'Stratejik Panel', level: 'read' as PermLevel, note: 'Salt Okunur' },
    { name: 'ESG Raporları', level: 'read' as PermLevel, note: 'Sadece Görüntüle' },
    { name: 'Sistem Ayarları', level: 'read' as PermLevel, note: 'Eşikler Salt Okunur' },
    { name: 'Kriz Seviyesi Yükseltme', level: 'none' as PermLevel },
  ] as Permission[],
}

// ─── Badge styles ────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<BadgeType, string> = {
  crisis: 'bg-[rgba(255,71,87,0.10)] text-[#ff4757]',
  sim: 'bg-[rgba(255,140,66,0.12)] text-[#ff8c42]',
  system: 'bg-[rgba(0,229,160,0.12)] text-[#00e5a0]',
  anomaly: 'bg-[rgba(255,209,102,0.12)] text-[#ffd166]',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useSessionDuration() {
  const startRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - startRef.current
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    const id = setInterval(tick, 1000)
    tick()
    return () => clearInterval(id)
  }, [])

  return elapsed
}

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = 'info' | 'activity' | 'permissions' | 'security'

const TAB_LABELS: Record<Tab, string> = {
  info: 'Genel Bilgiler',
  activity: 'Aktivite',
  permissions: 'Yetkiler',
  security: 'Güvenlik',
}

// ─── Main component ──────────────────────────────────────────────────────────

// Map crisis level to a readable Turkish label
const CRISIS_LABELS: Record<string, string> = {
  none: 'Normal',
  yellow: 'Sarı',
  orange: 'Turuncu',
  red: 'Kırmızı',
  KOD_KIRMIZI: 'Kırmızı',
  WATER_CUTOFF: 'Su Kesintisi',
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const notifLogs = useCrisisStore((s) => s.notificationLogs)
  const auditLogs = useCrisisStore((s) => s.auditLogs)
  const crisisLevel = useCrisisStore((s) => s.level)
  const mqttConnected = useConnectionStore((s) => s.mqttConnected)
  const { data: anomalies } = useAnomalies('ALL')
  const { fmtDateTime } = useDateFormat()

  const isStrategic = (user?.role ?? 'STRATEGIC') === 'STRATEGIC'
  const profile = isStrategic ? STRATEGIC_DATA : TECHNICAL_DATA

  const name = user?.name ?? (isStrategic ? 'Arif Yılmaz' : 'Emre Demir')
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sessionDuration = useSessionDuration()

  // Session start formatted according to the user's regional setting
  const sessionStartRef = useRef(new Date())
  const sessionStart = fmtDateTime(sessionStartRef.current)

  // Simülasyon sayısı: bugün tetiklenmiş audit log kayıtları
  const todayStr = new Date().toDateString()
  const simCount = auditLogs.filter(
    (l) =>
      (l.message.includes('simülasyon') || l.message.includes('SİMÜLASYON')) &&
      new Date(l.tsIso).toDateString() === todayStr,
  ).length

  // Bağlı fabrika: MQTT açıksa Offline olmayan fabrikalar
  const connectedFactories = mqttConnected ? FACTORIES.filter((f) => f.status !== 'Offline').length : 0

  // Activity stats mapped to live store/hook data
  const activityStats: ActivityStat[] = isStrategic
    ? [
        { value: String(simCount), label: 'Aktif Simülasyon' },
        { value: String(notifLogs.length), label: 'Okunmamış Bildirim' },
        { value: sessionDuration, label: 'Bu Oturum Süresi' },
      ]
    : [
        { value: String(anomalies?.length ?? '—'), label: 'İzlenen Anomali' },
        { value: CRISIS_LABELS[crisisLevel] ?? 'Normal', label: 'Aktif Kriz Seviyesi' },
        { value: String(connectedFactories), label: 'Bağlı Fabrika' },
      ]

  // Editable fields
  const [displayName, setDisplayName] = useState(name)
  const [department, setDepartment] = useState(profile.department)
  const [phone, setPhone] = useState(profile.phone)

  // Password fields
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [showToast, setShowToast] = useState(false)
  const [idCopied, setIdCopied] = useState(false)

  const handleSave = () => {
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2800)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id).catch(() => {})
    setIdCopied(true)
    window.setTimeout(() => setIdCopied(false), 2000)
  }

  // Theme tokens
  const accent = isStrategic ? '#a78bfa' : '#00d4ff'
  const accentSoft = isStrategic ? 'rgba(167,139,250,0.13)' : 'rgba(0,212,255,0.13)'
  const accentBorder = isStrategic ? 'rgba(167,139,250,0.35)' : 'rgba(0,212,255,0.35)'
  const avatarGradient = isStrategic
    ? 'linear-gradient(135deg, #a78bfa, #ff8c42)'
    : 'linear-gradient(135deg, #00d4ff, #33ddff)'
  const glowColor = isStrategic ? '#a78bfa' : '#00d4ff'

  const permLevelStyle = (p: Permission) => {
    if (p.level === 'full') return { badge: 'bg-[rgba(0,229,160,0.12)] text-[#00e5a0]', label: p.note ?? 'Tam Erişim' }
    if (p.level === 'exec') return { badge: 'bg-[rgba(255,209,102,0.10)] text-[#ffd166]', label: p.note ?? 'Çalıştırılabilir' }
    if (p.level === 'read') return { badge: 'bg-[rgba(255,209,102,0.10)] text-[#ffd166]', label: p.note ?? 'Salt Okunur' }
    return { badge: 'bg-[rgba(255,71,87,0.10)] text-[#ff4757]', label: 'Yetki Dışı' }
  }

  return (
    <div className="space-y-s6 page-enter-active">
      {/* Page header */}
      <header className="space-y-s1">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">/profil</p>
        <h1 className="font-display text-3xl font-semibold tracking-[0.10em]">Kullanıcı Profili</h1>
        <p className="text-sm text-slate">Hesap bilgileri, aktivite geçmişi ve güvenlik ayarları</p>
      </header>

      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[20px]">

        {/* Hero */}
        <div className="relative flex flex-wrap items-center gap-6 p-7">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-15 blur-[60px]"
            style={{ background: glowColor }}
          />

          {/* Avatar */}
          <div
            className="relative z-10 flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
            style={{ background: avatarGradient }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="relative z-10 min-w-0 flex-1">
            <p className="text-xs text-slate">Merhaba,</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{displayName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border px-3 py-0.5 text-xs font-medium"
                style={{ background: accentSoft, color: accent, borderColor: accentBorder }}
              >
                {isStrategic ? '◆ Stratejik Yönetici' : '⬡ Teknik Operatör'}
              </span>
              <span className="text-xs text-slate">{department}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="relative z-10 shrink-0 space-y-3 text-right">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Son Giriş</p>
              <p className="text-sm text-[#94a3b8]">{profile.lastLogin}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Toplam Oturum</p>
              <p className="text-sm text-[#94a3b8]">{profile.totalSessions}</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/5 bg-white/[0.02] px-7">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 px-4 py-3.5 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'text-white'
                  : 'border-transparent text-slate hover:text-white',
              )}
              style={activeTab === tab ? { borderBottomColor: accent } : {}}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-7">

          {/* ── Genel Bilgiler ── */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Kullanıcı ID</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="font-mono text-sm text-[#94a3b8]">{profile.id}</p>
                    <button
                      onClick={handleCopyId}
                      className="text-slate transition hover:text-white"
                      title="Kopyala"
                    >
                      {idCopied
                        ? <Check className="h-3.5 w-3.5 text-[#00e5a0]" />
                        : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Görev</p>
                  <p className="mt-2 text-sm italic text-[#94a3b8]">{profile.job}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Ad Soyad · düzenlenebilir</p>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-2 w-full border-b border-white/15 bg-transparent pb-0.5 text-sm text-white outline-none transition focus:border-white/40"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Departman · düzenlenebilir</p>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-2 w-full border-b border-white/15 bg-transparent pb-0.5 text-sm text-white outline-none transition focus:border-white/40"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">E-posta · salt okunur</p>
                  <p className="mt-2 text-sm italic text-[#94a3b8]">{profile.email}</p>
                  <p className="mt-1 text-[10px] text-slate">Değiştirmek için sistem yöneticisine başvurun.</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">Telefon · düzenlenebilir</p>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full border-b border-white/15 bg-transparent pb-0.5 text-sm text-white outline-none transition focus:border-white/40"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:opacity-80"
                style={{ background: accentSoft, color: accent, borderColor: accentBorder }}
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          )}

          {/* ── Aktivite ── */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {activityStats.map((stat, i) => {
                  const isCrisisStat = !isStrategic && stat.label === 'Aktif Kriz Seviyesi'
                  const crisisColor =
                    crisisLevel === 'none' ? '#94a3b8'
                    : crisisLevel === 'yellow' ? '#ffd166'
                    : '#ff4757'
                  const statColor = isCrisisStat ? crisisColor : accent
                  return (
                    <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                      <p className="text-2xl font-semibold" style={{ color: statColor }}>{stat.value}</p>
                      <p className="mt-1 text-xs text-slate">{stat.label}</p>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2">
                {profile.activityLog.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs"
                  >
                    <span className="w-12 shrink-0 font-mono text-[10px] text-slate">{entry.time}</span>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', BADGE_STYLES[entry.badge])}>
                      {entry.badgeLabel}
                    </span>
                    <span className="flex-1 text-[#94a3b8]">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Yetkiler ── */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {profile.permissions.map((perm, i) => {
                  const style = permLevelStyle(perm)
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"
                    >
                      <span className="text-[#94a3b8]">{perm.name}</span>
                      <span className={cn('rounded-full px-3 py-0.5 text-[11px] font-medium', style.badge)}>
                        {style.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-[11px] text-slate">
                Yetki değişiklikleri sistem yöneticisi onayı gerektirir. Talep için IT Destek: dahili 0-100
              </p>
            </div>
          )}

          {/* ── Güvenlik ── */}
          {activeTab === 'security' && (
            <div className="space-y-4">

              {/* Password */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Lock className="h-4 w-4 text-slate" aria-hidden />
                  Şifre Değiştirme
                </h3>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Mevcut şifre"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#94a3b8] outline-none placeholder:text-slate transition focus:border-white/20"
                  />
                  <input
                    type="password"
                    placeholder="Yeni şifre"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#94a3b8] outline-none placeholder:text-slate transition focus:border-white/20"
                  />
                  <input
                    type="password"
                    placeholder="Yeni şifre tekrar"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#94a3b8] outline-none placeholder:text-slate transition focus:border-white/20"
                  />
                  {newPwd && confirmPwd && newPwd === confirmPwd && (
                    <p className="flex items-center gap-1 text-[11px] text-[#00e5a0]">
                      <Check className="h-3 w-3" aria-hidden /> Şifreler eşleşiyor
                    </p>
                  )}
                  {newPwd && confirmPwd && newPwd !== confirmPwd && (
                    <p className="text-[11px] text-[#ff4757]">Şifreler eşleşmiyor</p>
                  )}
                  <p className="text-[10px] text-slate">Son değişiklik: {profile.lastPasswordChange}</p>
                </div>
                <button
                  onClick={handleSave}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:opacity-80"
                  style={{ background: accentSoft, color: accent, borderColor: accentBorder }}
                >
                  Şifreyi Güncelle
                </button>
              </div>

              {/* Active session */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Shield className="h-4 w-4 text-slate" aria-hidden />
                  Aktif Oturum
                </h3>
                <div className="space-y-0">
                  {([
                    ['Oturum başlangıcı', sessionStart],
                    ['Tarayıcı', profile.browser],
                    ['IP', '192.168.1.xx (yerel)'],
                  ] as [string, string][]).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-white/5 py-2 text-xs last:border-0">
                      <span className="text-slate">{key}</span>
                      <span className="font-mono text-[11px] text-[#94a3b8]">{val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  Tüm Oturumları Sonlandır
                </button>
              </div>

              {/* 2FA */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                    <UserRound className="h-4 w-4 text-slate" aria-hidden />
                    İki Faktörlü Doğrulama
                    <span className="ml-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ff4757]" />
                      <span className="text-xs text-slate">Henüz aktif değil</span>
                    </span>
                  </div>
                  <button className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs text-[#94a3b8] transition hover:border-white/20 hover:text-white">
                    Etkinleştir
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate">Etkinleştirmek için sistem yöneticisi onayı gerekir.</p>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.12)] px-5 py-3.5 text-sm text-[#00e5a0] shadow-xl backdrop-blur-xl">
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          İşlem kaydedildi, bildirim paneline düştü
        </div>
      )}
    </div>
  )
}
