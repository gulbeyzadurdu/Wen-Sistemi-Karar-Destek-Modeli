import { Moon, Sun, UserRound } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { IoTGatewayPanel } from '@/components/iot/IoTGatewayPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useAuthStore } from '@/stores/auth-store'
import { useConnectionStore } from '@/stores/connection-store'
import { useOpsStore } from '@/stores/ops-store'
import { type TelemetryThresholds, useThresholdStore } from '@/stores/threshold-store'
import { useThemeStore } from '@/stores/theme-store'

export function SettingsPage() {
  const logout = useAuthStore((store) => store.logout)
  const user = useAuthStore((store) => store.user)
  const mqttConnected = useConnectionStore((connection) => connection.mqttConnected)
  const toggleMqtt = useConnectionStore((connection) => connection.setMqttConnected)
  const theme = useThemeStore((store) => store.theme)
  const toggleTheme = useThemeStore((store) => store.toggleTheme)
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const selectedFactory = FACTORIES.find((factory) => factory.id === selectedFactoryId)
  const thresholds = useThresholdStore((state) => state.getValues(selectedFactoryId))
  const setThresholds = useThresholdStore((state) => state.setValuesForFactory)
  const resetThresholds = useThresholdStore((state) => state.resetFactoryValues)
  const notifications = useOpsStore((s) => s.notifications)
  const setNotification = useOpsStore((s) => s.setNotification)
  const regional = useOpsStore((s) => s.regional)
  const setRegional = useOpsStore((s) => s.setRegional)
  const sectionClass =
    theme === 'dark'
      ? 'space-y-s4 rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card'
      : 'space-y-s4 rounded-xl border border-border bg-card p-s5 shadow-card'
  const innerCardClass =
    theme === 'dark'
      ? 'rounded-xl border border-[#28415c] bg-[#0f1621] p-s5'
      : 'rounded-xl border border-border bg-elevated/70 p-s5'
  const rowCardClass =
    theme === 'dark'
      ? 'flex items-center justify-between gap-s4 rounded-xl border border-[#28415c] bg-[#0f1621] px-s5 py-s4'
      : 'flex items-center justify-between gap-s4 rounded-xl border border-border bg-elevated/70 px-s5 py-s4'
  const sectionTitleClass =
    theme === 'dark' ? 'font-mono text-xs tracking-[0.35em] text-[#9ec4df]' : 'font-mono text-xs tracking-[0.35em] text-slate'
  const fieldLabelClass = theme === 'dark' ? 'text-xs text-[#9ec4df]' : 'text-xs text-slate'
  const helpTextClass = theme === 'dark' ? 'text-xs text-slate' : 'text-xs text-muted-foreground'
  const selectClass =
    theme === 'dark'
      ? 'w-full rounded-md border border-[#28415c] bg-[#0f1621] px-s3 py-s2 text-sm text-foreground outline-none focus:border-[#22a7d8]'
      : 'w-full rounded-md border border-border bg-base px-s3 py-s2 text-sm text-foreground outline-none focus:border-input'

  const handleChange =
    (key: keyof TelemetryThresholds) =>
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setThresholds(selectedFactoryId, { ...thresholds, [key]: Number.parseFloat(target.value) })

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">/settings · kontrol odası</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.16em]">Sistem Parametreleri</h1>
        <p className="text-sm text-slate">Eşik, bildirim, bölgesel seçenekler ve simülasyonları tek panelden yönet.</p>
      </header>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Sistem Eşik Değerleri</h2>
        <div className="grid gap-s5 md:grid-cols-2">
          {(Object.entries(thresholds) as Array<[keyof TelemetryThresholds, number]>).map(([key, value]) => {
            const formatted =
              key.startsWith('water') ? `${value.toFixed(3)} m³` : `${value.toFixed(2)} kWh`
            const label =
              key === 'energyMin'
                ? 'Enerji · minimum'
                : key === 'energyMax'
                  ? 'Enerji · maksimum'
                  : key === 'waterMin'
                    ? 'Su · minimum'
                    : 'Su · maksimum'

            return (
              <label key={key} className={cn('space-y-s3', innerCardClass)}>
                <div className={cn('flex justify-between gap-s3 font-mono text-[11px] uppercase tracking-[0.45em]', theme === 'dark' ? 'text-[#9ec4df]' : 'text-slate')}>
                  <span>{label}</span>
                  <span className="text-foreground">{formatted}</span>
                </div>
                <input
                  type="range"
                  step={key.startsWith('water') ? '0.001' : '0.1'}
                  min={key.includes('energy') ? 4 : 7.85}
                  max={key.includes('energy') ? 24 : 13.05}
                  value={value}
                  onChange={handleChange(key)}
                  className="w-full accent-solar"
                />
              </label>
            )
          })}
        </div>
        <Button type="button" variant="outline" onClick={() => resetThresholds(selectedFactoryId)}>
          {selectedFactory ? 'Fabrika Varsayılan Eşiklerini Yükle' : 'Bölgesel Varsayılan Eşikleri Yükle'}
        </Button>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Bildirim Ayarları</h2>
        <div className="grid gap-s3">
          {[
            ['emailReports', 'E-posta ile Rapor Al', 'Günlük operasyonel raporların iletimi.'],
            ['smsCritical', 'Kritik Alarmlarda SMS Gönder', 'Acil durum bildirimleri.'],
            ['weeklySavings', 'Haftalık Tasarruf Özeti', 'Her Pazartesi 08:00 raporu.'],
            ['maintenanceReminders', 'Bakım Hatırlatıcıları', 'Planlı bakım bildirimleri.'],
          ].map(([key, label, description]) => {
            const typedKey = key as keyof typeof notifications
            const isActive = notifications[typedKey]
            return (
              <div key={key} className={rowCardClass}>
                <div>
                  <p className="text-base font-semibold text-foreground">{label}</p>
                  <p className={helpTextClass}>{description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotification(typedKey, !isActive)}
                  className={cn(
                    'rounded-full px-s5 py-s2 font-mono text-[11px] uppercase tracking-[0.4em]',
                    isActive ? 'bg-ok-soft text-ok' : 'bg-red-soft text-destructive',
                  )}
                >
                  {isActive ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Bölgesel Ayarlar</h2>
        <div className="grid gap-s4 md:grid-cols-3">
          <label className="space-y-s2">
            <span className={fieldLabelClass}>Dil</span>
            <select
              value={regional.language}
              onChange={(event) => setRegional('language', event.target.value as 'TR' | 'EN')}
              className={selectClass}
            >
              <option value="TR">TR</option>
              <option value="EN">EN</option>
            </select>
          </label>
          <label className="space-y-s2">
            <span className={fieldLabelClass}>Saat/Tarih Formatı</span>
            <select
              value={regional.dateTimeFormat}
              onChange={(event) => setRegional('dateTimeFormat', event.target.value as '24H' | '12H')}
              className={selectClass}
            >
              <option value="24H">24 Saat</option>
              <option value="12H">12 Saat</option>
            </select>
          </label>
          <label className="space-y-s2">
            <span className={fieldLabelClass}>Sıcaklık Birimi</span>
            <select
              value={regional.temperatureUnit}
              onChange={(event) => setRegional('temperatureUnit', event.target.value as 'C' | 'F')}
              className={selectClass}
            >
              <option value="C">°C</option>
              <option value="F">°F</option>
            </select>
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Bağlantı Simülasyonu</h2>
        <label className={rowCardClass}>
          <div>
            <p className="text-base font-semibold text-foreground">MQTT broker bağlantısı</p>
            <p className={helpTextClass}>{mqttConnected ? 'Canlı bağlantı' : 'Çevrimdışı · Redis yedek hat etkin'}</p>
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

      <IoTGatewayPanel />

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Tema ayarı</h2>
        <label className={rowCardClass}>
          <div>
            <p className="text-base font-semibold text-foreground">Arayüz teması</p>
            <p className={helpTextClass}>Açık ve karanlık tema arasında anında geçiş yapabilirsiniz.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-s2 rounded-full border border-border bg-base px-s4 py-s2 text-xs font-mono uppercase tracking-[0.35em] text-foreground transition hover:border-input"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4 text-solar" aria-hidden /> : <Sun className="h-4 w-4 text-energy" aria-hidden />}
            {theme === 'dark' ? 'Karanlık' : 'Açık'}
          </button>
        </label>
      </section>

      <section className={cn('rounded-xl bg-card p-s5 shadow-card', theme === 'dark' ? 'border border-[#1f3248]' : 'border border-border')}>
        <div className={cn('flex items-start gap-s4 rounded-xl px-s5 py-s5', theme === 'dark' ? 'border border-[#28415c] bg-[#0f1621]' : 'border border-border bg-elevated/70')}>
          <UserRound className="mt-[2px] h-5 w-5 text-solar" aria-hidden />
          <div className="space-y-s2">
            <p className={sectionTitleClass}>Aktif oturum</p>
            <p className="text-base font-semibold text-foreground">
              {user?.name ?? 'Misafir'} · {user?.role ?? 'N/A'}
            </p>
            <p className={helpTextClass}>
              Güvenlik gereği farklı bir kullanıcının ekranına geçiş yapılamaz. Farklı hesap için önce çıkış yapıp yeniden giriş yapın.
            </p>
          </div>
        </div>
      </section>

      <Button type="button" variant="destructive" className="w-full md:w-auto" onClick={logout}>
        Oturumu kapat · JWT mock temizle
      </Button>
    </div>
  )
}
