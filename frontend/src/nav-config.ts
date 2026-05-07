import {
  AlertTriangle,
  BarChart3,
  Bell,
  FileText,
  Flame,
  Gauge,
  History,
  LayoutDashboard,
  Settings2,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { UserRole } from '@/types/wen'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

export const STRATEGIC_LINKS: NavItem[] = [
  { to: '/dashboard-strategic', label: 'Stratejik dash', icon: LayoutDashboard },
  { to: '/analysis', label: 'Trend analizi', icon: BarChart3 },
  { to: '/reports', label: 'ESG raporu', icon: FileText },
  { to: '/notifications', label: 'Bildirimler', icon: Bell },
]

export const TECHNICAL_LINKS: NavItem[] = [
  { to: '/dashboard-technical', label: 'Operasyon gözü', icon: Gauge },
  { to: '/thresholds', label: 'Sensör eşikleri', icon: SlidersHorizontal },
  { to: '/historical', label: 'Ham veri', icon: History },
  { to: '/anomalies', label: 'Anomali', icon: AlertTriangle },
]

export const UNIVERSAL_LINKS: NavItem[] = [
  { to: '/crisis', label: 'Kriz protokolü', icon: Flame },
  { to: '/settings', label: 'Ayarlar', icon: Settings2 },
]

export function resolveNav(role: UserRole): NavItem[] {
  const core = role === 'STRATEGIC' ? STRATEGIC_LINKS : TECHNICAL_LINKS
  return [...core, ...UNIVERSAL_LINKS]
}
