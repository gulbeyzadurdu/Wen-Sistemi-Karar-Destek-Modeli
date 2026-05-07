import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { resolveNav } from '@/nav-config'
import { useAuthStore } from '@/stores/auth-store'

export function MobileNav() {
  const role = useAuthStore((s) => s.role)
  const links = resolveNav(role)

  return (
    <div className="lg:hidden">
      <div className="-mx-s4 mb-s6 flex gap-s2 overflow-x-auto border-y border-border bg-card px-s4 py-s3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center gap-s2 rounded-pill px-s4 py-s2 font-mono text-[11px] uppercase tracking-[0.35em]',
                isActive ? 'bg-elevated text-foreground shadow-card' : 'bg-transparent text-slate hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 text-energy" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
