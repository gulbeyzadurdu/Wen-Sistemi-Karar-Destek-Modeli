import { Megaphone, PlayCircle, ShieldOff } from 'lucide-react'

import { ProtocolChecklist, type ChecklistStep } from '@/components/crisis/ProtocolChecklist'
import { Button } from '@/components/ui/button'
import { playAlarmTone } from '@/lib/alarm'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useCrisisStore } from '@/stores/crisis-store'

const ORANGE_PREP: ChecklistStep[] = [
  { id: 'prep-shift', label: 'Vardiya liderleri bilgilendirilsin mi? onay kutularını sırayla kullanın.' },
  { id: 'prep-kit', label: 'Acil durum dolabı fiziksel doğrulama (liste imzalı)' },
  { id: 'prep-branch', label: 'İlgili manifold hattı izolasyon görevleri planlansın' },
]

const RED_SEQUENCE: ChecklistStep[] = [
  { id: 'red-stop-pump', label: '1 · Pompayı güvenli modda durdur' },
  { id: 'red-close-valve', label: '2 · Ana su valf kapama prosedürü' },
  { id: 'red-emergency-call', label: '3 · Acil müdahale ekibini arayın ( dahili + harici)' },
]

export function CrisisPage() {
  const level = useCrisisStore((levelState) => levelState.level)
  const escalateToRed = useCrisisStore((levelState) => levelState.escalateToRed)
  const resolveIncident = useCrisisStore((levelState) => levelState.resolveIncident)
  const resetSystem = useCrisisStore((levelState) => levelState.resetSystem)
  const notifyAck = useCrisisStore((levelState) => levelState.notifyTeamAck)
  const setNotifyTeamAck = useCrisisStore((levelState) => levelState.setNotifyTeamAck)
  const startInterventionSimulation = useCrisisStore((s) => s.startInterventionSimulation)
  const userId = useAuthStore((auth) => auth.user?.id ?? 'guest')

  const handleInterventionSimulation = () => {
    playAlarmTone(0.12)
    startInterventionSimulation(userId)
  }

  return (
    <div
      className={cn(
        'space-y-s6 rounded-3xl border border-border px-s6 py-s10 shadow-card',
        level === 'red' || level === 'KOD_KIRMIZI' || level === 'WATER_CUTOFF' ? 'animate-crisis-flash motion-reduce:animate-none' : '',
        level === 'red' || level === 'KOD_KIRMIZI' || level === 'WATER_CUTOFF'
          ? 'bg-red-soft border-destructive/40 text-destructive'
          : level === 'orange'
            ? 'bg-warn-soft'
            : '',
      )}
    >
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/kriz-protokolu</p>
        <h1 className="font-display text-4xl text-foreground drop-shadow-[0_0_18px_var(--destructive)]">Kriz müdahale motoru</h1>
        <p className="text-slate">Sarı gözlem, turuncu hazırlık ve kod kırmızı aksiyon seviye makinesinin mock arayüzü</p>
      </header>

      {level === 'none' ? (
        <p className="rounded-2xl border border-border bg-card p-s6 text-base text-muted-foreground">
          Şu anda aktif kriz bildirimi yok. Nexustan gelecek otomatik sinyaller bu ekranın üst bağlantılı şekilde tetiklenir.
        </p>
      ) : null}

      <section className="glass-card flex flex-wrap items-center justify-between gap-s4 border border-white/10 p-6">
        <div>
          <h2 className="font-semibold text-slate-100">Müdahale Simülasyonu</h2>
          <p className="mt-1 text-xs text-slate">
            Kriz müdahale protokolünü başlat — bildirim kanalları, denetim kaydı ve turuncu hazırlık checklist'i tetiklenir.
          </p>
        </div>
        <Button
          onClick={handleInterventionSimulation}
          className="bg-[#22a7d8] font-semibold text-[#04111a] hover:bg-[#40b8e4]"
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          Müdahale Simülasyonunu Başlat
        </Button>
      </section>

      {level === 'yellow' ? (
        <aside className="rounded-2xl border border-warn/40 bg-warn-soft px-s6 py-s4 text-lg font-semibold text-warn">
          Gözlem modu aktif · veri doğrulanana kadar ekip bildirildi ancak aksiyon gerekmez.
        </aside>
      ) : null}

      {level === 'orange' ? (
        <section className="space-y-s5 rounded-2xl border border-energy/35 bg-card/80 p-s6 backdrop-blur">
          <header className="flex flex-wrap items-start justify-between gap-s4">
            <div className="space-y-s2">
              <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-solar">Turuncu · hazırlık checklist</p>
              <p className="text-muted-foreground">Her adım onayında audit mock PUT yazılır (`user_id` + `timestamp`).</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setNotifyTeamAck(!notifyAck)}
              className="inline-flex items-center gap-s2"
            >
              <Megaphone className="h-5 w-5" aria-hidden />
              {notifyAck ? 'Ekip bilgilendirildi (mock ACK)' : 'Notify Team'}
            </Button>
          </header>
          <ProtocolChecklist sequenced={false} userId={userId} steps={ORANGE_PREP} />
          <div className="flex flex-wrap gap-s4">
            <Button type="button" variant="destructive" onClick={escalateToRed}>
              Kod Kırmızıya çık
            </Button>
          </div>
        </section>
      ) : null}

      {(level === 'red' || level === 'KOD_KIRMIZI' || level === 'WATER_CUTOFF') ? (
        <section className={cn('space-y-s5 rounded-2xl border border-destructive/60 bg-card/92 p-s6 backdrop-blur')}>
          <div className="flex flex-wrap items-center justify-between gap-s4 border-b border-destructive/40 pb-s4 font-mono text-[11px] uppercase tracking-[0.55em] text-destructive">
            <span className="text-base font-semibold">{level === 'WATER_CUTOFF' ? 'ACİL SU KESİNTİSİ' : 'KOD KIRMIZI'}</span>
            <span className="text-xs lowercase tracking-normal text-muted-foreground">Sesli uyarı tasarında · tarayıcı engeline karşı bildirimi manuel doğrula</span>
          </div>
          <ProtocolChecklist sequenced userId={userId} steps={RED_SEQUENCE} />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-s4">
        <Button type="button" variant="outline" disabled={level === 'none'} onClick={resolveIncident} className="inline-flex gap-s3">
          <ShieldOff aria-hidden /> Olay çözümü · `/crisis/resolve` mock
        </Button>
        <Button type="button" variant="destructive" onClick={resetSystem}>
          Reset System
        </Button>
      </div>
    </div>
  )
}
