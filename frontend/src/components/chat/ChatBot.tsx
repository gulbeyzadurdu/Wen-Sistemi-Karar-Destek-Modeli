import { Bot, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useTechnicalSeries } from '@/hooks/useLiveTelemetry'
import { getChatResponse, type DashboardContext } from '@/lib/api-client'
import { FACTORIES } from '@/mocks/factories'
import { useAuthStore } from '@/stores/auth-store'
import { useCrisisStore } from '@/stores/crisis-store'
import { useOpsStore } from '@/stores/ops-store'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  'Anlık Nexus oranım kaç?',
  'Trend grafiğini yorumla',
  'Anomali durumunda ne yapmalıyım?',
  'Su kesintisi protokolü nedir?',
]

function useContextSnapshot(): DashboardContext {
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const crisisLevel = useCrisisStore((s) => s.level)
  const { data: series } = useTechnicalSeries()

  const selectedFactory = FACTORIES.find((f) => f.id === selectedFactoryId)
  const scopedFactories = selectedFactory ? [selectedFactory] : FACTORIES

  const avgEnergy =
    scopedFactories.reduce((acc, f) => acc + f.energyConsumption, 0) / scopedFactories.length
  const avgWater =
    scopedFactories.reduce((acc, f) => acc + f.waterConsumption, 0) / scopedFactories.length
  const avgRatio =
    scopedFactories.reduce((acc, f) => acc + f.nexusRatio, 0) / scopedFactories.length

  // Son 6 noktayı aylık özet olarak al (tekrar eden zaman etiketleri yerine sıralı index)
  const trendData = series
    ? series
        .filter((_, i) => i % Math.max(1, Math.floor(series.length / 6)) === 0)
        .slice(0, 6)
        .map((row, i) => ({
          month: row.t ?? `T${i + 1}`,
          energy: row.energy,
          water: row.water,
        }))
    : undefined

  return {
    energy_kwh: avgEnergy,
    water_m3: avgWater,
    nexus_ratio: avgRatio,
    anomaly_flag: avgRatio > 1.5,
    crisis_level: crisisLevel,
    selected_factory: selectedFactory?.name ?? 'BOSB Geneli',
    trend_data: trendData,
  }
}

export function ChatBot() {
  const displayName = useAuthStore((s) => s.user?.name ?? '')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'ai',
      text: displayName
        ? `Merhaba ${displayName}! Nasıl yardımcı olabilirim?`
        : 'Merhaba! Ben WEN Nexus AI asistanıyım. Nasıl yardımcı olabilirim?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const context = useContextSnapshot()

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: trimmed },
    ])
    setLoading(true)

    try {
      const { reply } = await getChatResponse(trimmed, context)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', text: reply },
      ])
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Bağlantı hatası'
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', text: `Hata: ${detail}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  return (
    <>
      {/* Chat penceresi */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[340px] flex-col rounded-xl border border-[#1e3248] bg-[#0b1220] shadow-[0_8px_40px_rgba(0,0,0,0.6)] sm:w-[380px]">
          {/* Başlık */}
          <div className="flex items-center justify-between rounded-t-xl border-b border-[#1e3248] bg-[#0f1c30] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22a7d8]/20">
                <Bot className="h-4 w-4 text-[#22a7d8]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e6edf5]">WEN Nexus AI</p>
                <p className="text-[10px] text-[#4a7fa5]">
                  {context.selected_factory} · Canlı Bağlam
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-[#4a7fa5] transition hover:bg-[#1a2d44] hover:text-[#e6edf5]"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Canlı bağlam şeridi */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-[#1e3248] bg-[#060d18] px-4 py-1.5">
            <span className="text-[10px] text-[#4a7fa5]">
              E={context.energy_kwh?.toFixed(1)} kWh
            </span>
            <span className="text-[10px] text-[#4a7fa5]">
              S={context.water_m3?.toFixed(1)} m³
            </span>
            <span className="text-[10px] text-[#4a7fa5]">
              Rn={context.nexus_ratio?.toFixed(3)}
            </span>
            <span
              className={cn(
                'text-[10px]',
                context.crisis_level === 'none' || !context.crisis_level
                  ? 'text-[#1dae6f]'
                  : 'text-[#f07c20]',
              )}
            >
              Kriz: {context.crisis_level ?? 'none'}
            </span>
          </div>

          {/* Mesajlar */}
          <div className="flex h-64 flex-col gap-3 overflow-y-auto px-4 py-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-[#22a7d8] text-[#04111a]'
                    : 'mr-auto border border-[#1e3248] bg-[#111d2e] text-[#c8daea]',
                )}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex items-center gap-1.5 rounded-xl border border-[#1e3248] bg-[#111d2e] px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#22a7d8] [animation-delay:300ms]" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Öneri butonları */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[#1e3248] px-4 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void sendMessage(s)}
                  className="rounded-full border border-[#1e3248] bg-[#0f1c30] px-2.5 py-1 text-[11px] text-[#7bafc9] transition hover:border-[#22a7d8]/50 hover:text-[#22a7d8]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-[#1e3248] px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Soru sorun… (Enter ile gönder)"
              disabled={loading}
              className="flex-1 resize-none rounded-lg border border-[#1e3248] bg-[#0f1c30] px-3 py-2 text-sm text-[#e6edf5] placeholder:text-[#3a5a78] focus:border-[#22a7d8]/60 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#22a7d8] text-[#04111a] transition hover:bg-[#40b8e4] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Gönder"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tetikleyici buton */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_24px_rgba(34,167,216,0.35)] transition-all duration-300',
          open
            ? 'bg-[#22a7d8] text-[#04111a] hover:bg-[#40b8e4]'
            : 'bg-[#0f1c30] border border-[#22a7d8]/40 text-[#22a7d8] hover:bg-[#152a40] hover:border-[#22a7d8]',
        )}
        aria-label="AI Asistan"
      >
        <Bot className="h-6 w-6" />
      </button>
    </>
  )
}
