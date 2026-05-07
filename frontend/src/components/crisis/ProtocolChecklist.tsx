import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { putChecklistAudit } from '@/lib/audit-client'

export type ChecklistStep = {
  id: string
  label: string
}

type Props = {
  steps: ChecklistStep[]
  /** Kod Kırmızı için sırayı zorunlu tutar */
  sequenced?: boolean
  userId: string
  className?: string
}

export function ProtocolChecklist({ steps, sequenced = false, userId, className }: Props) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState<string | null>(null)

  const orderedIds = steps.map((s) => s.id)
  const firstIncomplete = orderedIds.find((id) => !completed[id])

  const toggle = async (step: ChecklistStep) => {
    if (sequenced && firstIncomplete && step.id !== firstIncomplete) return
    if (pending) return

    const next = !completed[step.id]
    if (!next) {
      setCompleted((prev) => ({ ...prev, [step.id]: false }))
      return
    }

    setPending(step.id)
    await putChecklistAudit({
      step_id: step.id,
      timestamp: new Date().toISOString(),
      user_id: userId,
    })
    setCompleted((prev) => ({ ...prev, [step.id]: true }))
    setPending(null)
  }

  return (
    <ol className={cn('space-y-s3', className)}>
      {steps.map((step, index) => {
        const locked = sequenced && firstIncomplete ? step.id !== firstIncomplete && !completed[step.id] : false
        const isDone = completed[step.id]

        return (
          <li
            key={step.id}
            className={cn(
              'rounded-lg border border-border bg-elevated/60 p-s4 transition-colors duration-fast',
              locked && 'opacity-40',
              isDone && 'border-ok/40 bg-ok-soft/30',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-s3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Adım {index + 1}</p>
                <p className="text-base font-semibold">{step.label}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isDone ? 'success' : 'outline'}
                disabled={locked || Boolean(pending)}
                onClick={() => void toggle(step)}
                className="min-w-[140px]"
              >
                {pending === step.id ? (
                  <span className="inline-flex items-center gap-s2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kayıt
                  </span>
                ) : isDone ? (
                  'Tamamlandı'
                ) : (
                  'Onayla'
                )}
              </Button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
