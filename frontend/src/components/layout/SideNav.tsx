import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { resolveNav } from '@/nav-config'
import { useAuthStore } from '@/stores/auth-store'

export function SideNav() {
  const role = useAuthStore((s) => s.user?.role ?? 'STRATEGIC')
  const links = resolveNav(role)
  const roleLabel = role === 'STRATEGIC' ? 'Yönetici Paneli' : 'Operasyon Paneli'

  return (
    <nav
      aria-label="WEN görünüm menüsü"
      className="glass-sidebar flex h-full flex-col justify-between px-s4 py-s6 text-sm"
    >
      <div>
        <p className="px-s2 pb-s3 font-mono text-[11px] uppercase tracking-[0.12em] text-slate">{roleLabel}</p>
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
    </nav>
  )
}
