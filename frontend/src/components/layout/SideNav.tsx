import { Activity } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { resolveNav } from '@/nav-config'
import { useAuthStore } from '@/stores/auth-store'

export function SideNav() {
  const role = useAuthStore((s) => s.user?.role ?? 'STRATEGIC')
  const links = resolveNav(role)

  return (
    <nav
      aria-label="WEN görünüm menüsü"
      className="flex h-full flex-col gap-s5 border-r border-border bg-card/92 px-s4 py-s6 text-sm backdrop-blur"
    >
      <div>
        <p className="px-s2 pb-s3 font-mono text-[11px] uppercase tracking-[0.45em] text-slate">{role}-MOD</p>
        <ul className="space-y-s1">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-s3 rounded-md px-s3 py-s2 font-semibold text-slate transition-colors duration-fast',
                    isActive
                      ? 'bg-elevated text-foreground shadow-card'
                      : 'hover:bg-elevated/60 hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4 text-water" aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto rounded-md border border-border bg-base/60 p-s3 text-xs text-slate">
        <div className="flex items-center gap-s2">
          <Activity className="h-4 w-4 text-solar" aria-hidden />
          <p>
            MQTT örnek akışı + Redis yedek hat senaryolarını <span className="text-foreground">Ayarlar</span> üzerinden aç.
          </p>
        </div>
      </div>
    </nav>
  )
}
