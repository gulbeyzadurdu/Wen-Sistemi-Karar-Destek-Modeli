import { Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RoleGate } from '@/components/auth/RoleGate'

import { AnomaliesPage } from '@/pages/AnomaliesPage'
import { AnalysisPage } from '@/pages/AnalysisPage'
import { CrisisPage } from '@/pages/CrisisPage'
import { HistoricalPage } from '@/pages/HistoricalPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { RoleHomeRedirect } from '@/pages/RoleHomeRedirect'
import { SettingsPage } from '@/pages/SettingsPage'
import { SimulationCenterPage } from '@/pages/SimulationCenterPage'
import { StrategicDashboardPage } from '@/pages/StrategicDashboardPage'
import { TechnicalDashboardPage } from '@/pages/TechnicalDashboardPage'

import { ProtectedLayout } from '@/providers/ProtectedLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<RequireAuth />}>
        <Route element={<ProtectedLayout />}>
          <Route index element={<RoleHomeRedirect />} />

          <Route
            path="dashboard-strategic"
            element={
              <RoleGate allow="STRATEGIC">
                <StrategicDashboardPage />
              </RoleGate>
            }
          />

          <Route
            path="analysis"
            element={
              <RoleGate allow="STRATEGIC">
                <AnalysisPage />
              </RoleGate>
            }
          />

          <Route
            path="reports"
            element={
              <RoleGate allow="STRATEGIC">
                <ReportsPage />
              </RoleGate>
            }
          />

          <Route
            path="notifications"
            element={
              <RoleGate allow="STRATEGIC">
                <NotificationsPage />
              </RoleGate>
            }
          />

          <Route
            path="dashboard-technical"
            element={
              <RoleGate allow="TECHNICAL">
                <TechnicalDashboardPage />
              </RoleGate>
            }
          />

          <Route
            path="historical"
            element={
              <RoleGate allow="TECHNICAL">
                <HistoricalPage />
              </RoleGate>
            }
          />

          <Route
            path="anomalies"
            element={
              <RoleGate allow="TECHNICAL">
                <AnomaliesPage />
              </RoleGate>
            }
          />

          <Route path="crisis" element={<CrisisPage />} />
          <Route path="simulations" element={<SimulationCenterPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
