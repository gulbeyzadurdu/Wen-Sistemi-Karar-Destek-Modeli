import { AlarmClockCheck, BellRing, MailPlus } from 'lucide-react'

const SAMPLE = [
  {
    Icon: AlarmClockCheck,
    title: 'Otomatik hatırlatma',
    summary: 'BOSB elektrik tarifesi revizyonu · onay gerekiyor',
    ts: 'Az önce · MQTT topic `wen/finance/reminder`',
  },
  {
    Icon: MailPlus,
    title: 'E-posta bildirimi',
    summary: 'Kod Sarı uyarısı yönlendirildi · Arif, Selin',
    ts: '12 dk önce',
  },
  {
    Icon: BellRing,
    title: 'Anomali sonrası doğrulama',
    summary: 'ANM-921 manuel doğrulanmadı — operasyon incelemesinde kalın',
    ts: '38 dk önce',
  },
] as const

export function NotificationsPage() {
  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/bildirimler</p>
        <h1 className="font-display text-4xl tracking-[0.12em]">Bildirim Merkezi</h1>
        <p className="text-slate">MQTT ve e-posta kanallarından gelen statik mock kayıtlar</p>
      </header>

      <ul className="space-y-s4">
        {SAMPLE.map(({ Icon, title, summary, ts }) => (
          <li key={title} className="rounded-xl border border-border bg-card p-s6 shadow-card">
            <div className="flex flex-wrap items-start gap-s4">
              <Icon className="h-6 w-6 text-water" aria-hidden />
              <div className="space-y-s2">
                <div className="flex flex-wrap gap-s3 font-semibold tracking-[0.2em] text-slate">
                  <span className="text-foreground">{title}</span>
                  <span className="font-mono text-[10px] text-solar">{ts}</span>
                </div>
                <p className="max-w-content text-base text-muted-foreground">{summary}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
