import { Cpu, Waves } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useConnectionStore } from '@/stores/connection-store'
import type { UserRole } from '@/types/wen'

export function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((store) => store.logout)
  const login = useAuthStore((store) => store.login)
  const mqttConnected = useConnectionStore((connection) => connection.mqttConnected)
  const toggleMqtt = useConnectionStore((connection) => connection.setMqttConnected)

  const switchRole: (role: UserRole) => MouseEventHandler<HTMLButtonElement> = (role) => () => {
    login(role)
    navigate(role === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical', { replace: true })
  }

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/settings · ortak görünüm</p>
        <h1 className="font-display text-4xl">Sistem parametreleri</h1>
        <p className="text-slate">MQTT failover ve rol değişimi gibi bağlayıcı deneyleri bu ekrandan yönet.</p>
      </header>

      <section className="space-y-s4 rounded-2xl border border-border bg-card p-s6 shadow-card">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Bağlantı simülasyonu</h2>
        <label className="flex flex-wrap items-center justify-between gap-s4 rounded-xl border border-border bg-elevated/60 px-s5 py-s4">
          <div>
            <p className="text-base font-semibold text-foreground">MQTT broker bağlantısı</p>
            <p className="text-xs text-muted-foreground">{mqttConnected ? 'Canlı bağlantı' : 'Çevrimdışı · Redis fallback etkin'}</p>
          </div>
          <button
            type="button"
            aria-pressed={mqttConnected ? 'false' : 'true'}
            onClick={() => toggleMqtt(!mqttConnected)}
            className={`rounded-full px-s6 py-s2 font-mono text-[11px] uppercase tracking-[0.45em] ${
              mqttConnected ? 'bg-ok-soft text-ok' : 'bg-red-soft text-destructive'
            }`}
          >
            {mqttConnected ? 'MQTT kes' : 'MQTT aç'}
          </button>
        </label>
      </section>

      <section className="grid gap-s4 rounded-2xl border border-border bg-card p-s6 shadow-card md:grid-cols-2">
        <button
          type="button"
          onClick={switchRole('STRATEGIC')}
          className="flex flex-col gap-s3 rounded-xl border border-border px-s5 py-s6 text-left transition hover:border-energy/70"
        >
          <Waves className="h-6 w-6 text-water" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">ROLE · STRATEGIC</span>
          <span className="text-xl font-semibold">Arif görünümüne geç</span>
        </button>
        <button
          type="button"
          onClick={switchRole('TECHNICAL')}
          className="flex flex-col gap-s3 rounded-xl border border-border px-s5 py-s6 text-left transition hover:border-solar/70"
        >
          <Cpu className="h-6 w-6 text-solar" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">ROLE · TECHNICAL</span>
          <span className="text-xl font-semibold">Emre görünümüne geç</span>
        </button>
      </section>

      <Button type="button" variant="destructive" className="w-full md:w-auto" onClick={logout}>
        Oturumu kapat · JWT mock temizle
      </Button>
    </div>
  )
}
