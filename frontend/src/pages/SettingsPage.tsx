import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { type ChangeEvent, useEffect, useState } from 'react'

import { useDateFormat } from '@/hooks/useDateFormat'

import { IoTGatewayPanel } from '@/components/iot/IoTGatewayPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FACTORIES } from '@/mocks/factories'
import { useConnectionStore } from '@/stores/connection-store'
import { useOpsStore } from '@/stores/ops-store'
import { type TelemetryThresholds, useThresholdStore } from '@/stores/threshold-store'

export function SettingsPage() {
  const mqttConnected = useConnectionStore((connection) => connection.mqttConnected)
  const toggleMqtt = useConnectionStore((connection) => connection.setMqttConnected)
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const selectedFactory = FACTORIES.find((factory) => factory.id === selectedFactoryId)
  const thresholds = useThresholdStore((state) => state.getValues(selectedFactoryId))
  const setThresholds = useThresholdStore((state) => state.setValuesForFactory)
  const resetThresholds = useThresholdStore((state) => state.resetFactoryValues)
  const notifications = useOpsStore((s) => s.notifications)
  const setNotification = useOpsStore((s) => s.setNotification)
  const regional = useOpsStore((s) => s.regional)
  const setRegional = useOpsStore((s) => s.setRegional)

  const { fmtDateTime } = useDateFormat()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const [testingConn, setTestingConn] = useState(false)
  const [connResult, setConnResult] = useState<'success' | 'fail' | null>(null)
  const [savingThresholds, setSavingThresholds] = useState(false)
  const [thresholdSaved, setThresholdSaved] = useState(false)

  const handleTestConnection = () => {
    setConnResult(null)
    setTestingConn(true)
    window.setTimeout(() => {
      setTestingConn(false)
      setConnResult(mqttConnected ? 'success' : 'fail')
      window.setTimeout(() => setConnResult(null), 3000)
    }, 1200)
  }

  const handleSaveThresholds = () => {
    setThresholdSaved(false)
    setSavingThresholds(true)
    window.setTimeout(() => {
      setSavingThresholds(false)
      setThresholdSaved(true)
      window.setTimeout(() => setThresholdSaved(false), 3000)
    }, 900)
  }

  const formattedDateTime = fmtDateTime(now)

  const sectionClass = 'space-y-s4 rounded-xl border border-[#1f3248] bg-card p-s5 shadow-card'
  const innerCardClass = 'rounded-xl border border-[#28415c] bg-[#0f1621] p-s5'
  const rowCardClass = 'flex items-center justify-between gap-s4 rounded-xl border border-[#28415c] bg-[#0f1621] px-s5 py-s4'
  const sectionTitleClass = 'font-mono text-xs tracking-[0.35em] text-[#9ec4df]'
  const fieldLabelClass = 'text-xs text-[#9ec4df]'
  const helpTextClass = 'text-xs text-slate'
  const selectClass = 'w-full rounded-md border border-[#28415c] bg-[#0f1621] px-s3 py-s2 text-sm text-foreground outline-none focus:border-[#22a7d8]'

  const handleChange =
    (key: keyof TelemetryThresholds) =>
    ({ target }: ChangeEvent<HTMLInputElement>) =>
      setThresholds(selectedFactoryId, { ...thresholds, [key]: Number.parseFloat(target.value) })

  return (
    <div className="space-y-s6">
      <header className="space-y-s2">
        <div className="flex flex-wrap items-center justify-between gap-s3">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Sistem Ayarlar Merkezi</p>
          <p className="font-mono text-[11px] text-slate">{formattedDateTime}</p>
        </div>
        <h1 className="font-display text-4xl uppercase tracking-[0.16em]">Sistem Parametreleri</h1>
        <p className="text-sm text-slate">Eşik, bildirim, bölgesel seçenekler ve simülasyonları tek panelden yönet.</p>
      </header>

      {/* Eşik Değerleri */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-s3">
          <h2 className={sectionTitleClass}>Sistem Eşik Değerleri</h2>
          <button
            type="button"
            onClick={handleSaveThresholds}
            disabled={savingThresholds}
            className={cn(
              'inline-flex items-center gap-s2 rounded-md px-s4 py-s2 font-mono text-[11px] uppercase tracking-[0.35em] transition',
              thresholdSaved
                ? 'bg-ok-soft text-ok'
                : 'border border-border bg-elevated text-foreground hover:border-input',
            )}
          >
            {savingThresholds ? (
              <><Loader2 className="h-3 w-3 animate-spin" />Kaydediliyor...</>
            ) : thresholdSaved ? (
              <><CheckCircle className="h-3 w-3" />Kaydedildi</>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
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
                <div className="flex justify-between gap-s3 font-mono text-[11px] uppercase tracking-[0.35em] text-[#9ec4df]">
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

      {/* Bildirim Ayarları */}
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

      {/* Bölgesel Ayarlar */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Bölgesel Ayarlar</h2>
        <div className="grid gap-s4 md:grid-cols-2">
          <label className="space-y-s2">
            <span className={fieldLabelClass}>Saat/Tarih Formatı</span>
            <select
              value={regional.dateTimeFormat}
              onChange={(event) => setRegional('dateTimeFormat', event.target.value as '24H' | '12H')}
              className={selectClass}
            >
              <option value="24H">GG.AA.YYYY — SS:dd (24 saat)</option>
              <option value="12H">AA/GG/YYYY — ss:dd AM/PM (12 saat)</option>
            </select>
          </label>
          <label className="space-y-s2">
            <span className={fieldLabelClass}>Sıcaklık Birimi</span>
            <select
              value={regional.temperatureUnit}
              onChange={(event) => setRegional('temperatureUnit', event.target.value as 'C' | 'F')}
              className={selectClass}
            >
              <option value="C">°C — Celsius</option>
              <option value="F">°F — Fahrenheit</option>
            </select>
          </label>
        </div>
      </section>

      {/* Bağlantı Simülasyonu */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Bağlantı Simülasyonu</h2>
        <label className={rowCardClass}>
          <div>
            <p className="text-base font-semibold text-foreground">MQTT broker bağlantısı</p>
            <p className={helpTextClass}>{mqttConnected ? 'Canlı bağlantı' : 'Çevrimdışı · Redis yedek hat etkin'}</p>
          </div>
          <div className="flex items-center gap-s3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConn}
              className={cn(
                'inline-flex items-center gap-s2 rounded-full px-s5 py-s2 font-mono text-[11px] uppercase tracking-[0.4em] transition',
                connResult === 'success'
                  ? 'bg-ok-soft text-ok'
                  : connResult === 'fail'
                    ? 'bg-red-soft text-destructive'
                    : 'border border-border bg-elevated text-foreground hover:border-input',
              )}
            >
              {testingConn ? (
                <><Loader2 className="h-3 w-3 animate-spin" />Bağlanıyor...</>
              ) : connResult === 'success' ? (
                <><CheckCircle className="h-3 w-3" />Bağlantı Başarılı</>
              ) : connResult === 'fail' ? (
                <><XCircle className="h-3 w-3" />Bağlantı Başarısız</>
              ) : (
                'Bağlantıyı Test Et'
              )}
            </button>
            <button
              type="button"
              aria-pressed={mqttConnected ? 'false' : 'true'}
              onClick={() => toggleMqtt(!mqttConnected)}
              className={`rounded-full px-s6 py-s2 font-mono text-[11px] uppercase tracking-[0.45em] ${
                mqttConnected ? 'bg-ok-soft text-ok' : 'bg-red-soft text-destructive'
              }`}
            >
              {mqttConnected ? 'MQTT Kes' : 'MQTT Aç'}
            </button>
          </div>
        </label>
      </section>

      <IoTGatewayPanel />
    </div>
  )
}
