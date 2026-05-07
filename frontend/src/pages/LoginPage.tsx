import { Cpu, Waves } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { Navigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/wen'

export function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const login = useAuthStore((s) => s.login)

  if (token) {
    const role = useAuthStore.getState().role
    const home = role === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical'
    return <Navigate to={home} replace />
  }

  const enter: (role: UserRole, name?: string) => MouseEventHandler<HTMLButtonElement> =
    (role, name) =>
    () => {
      login(role, name)
    }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-base px-s4 py-s16 text-center text-foreground">
      <div className="mx-auto w-full max-w-lg space-y-s8 rounded-2xl border border-border bg-card/90 p-s8 shadow-card backdrop-blur">
        <div className="space-y-s4">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">WEN Nexus DS · PRD doğrultusunda demo</p>
          <div className="space-y-s2">
            <h1 className="font-display text-display-xl">Water · Energy Nexus</h1>
            <p className="text-base text-slate">
              JWT mock akışını tetiklemek için strateji veya operasyon rolünden seçim yapın. Gerçek API bağlandığında bu ekranda form
              değiştirilecek.
            </p>
          </div>
        </div>

        <div className="grid gap-s4 sm:grid-cols-2">
          <Button type="button" size="lg" className="h-auto py-s6 text-left shadow-card" onClick={enter('STRATEGIC', 'Arif Yalçın')}>
            <span className="flex flex-col gap-s3">
              <Waves className="h-6 w-6 text-water" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-[0.45em] text-slate">Strategic</span>
              <span className="text-lg font-semibold">Dashboard strateji</span>
            </span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="h-auto border border-border bg-elevated py-s6 text-left shadow-none"
            onClick={enter('TECHNICAL', 'Emre Demir')}
          >
            <span className="flex flex-col gap-s3">
              <Cpu className="h-6 w-6 text-solar" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-[0.45em] text-slate">Technical</span>
              <span className="text-lg font-semibold">Operasyon konsolu</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
