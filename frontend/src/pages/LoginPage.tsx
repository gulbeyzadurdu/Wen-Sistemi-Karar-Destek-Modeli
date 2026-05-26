import { Eye, EyeOff, Lock, User, Waves } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { login as apiLogin } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userRole = useAuthStore((s) => s.user?.role)
  const login = useAuthStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [showSupportMessage, setShowSupportMessage] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !userRole) return
    const target = userRole === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical'
    navigate(target, { replace: true })
  }, [isAuthenticated, navigate, userRole])

  if (isAuthenticated && userRole) {
    const home = userRole === 'STRATEGIC' ? '/dashboard-strategic' : '/dashboard-technical'
    return <Navigate to={home} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    const normalizedUsername = username.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setError('Kullanıcı adı veya şifre boş bırakılamaz')
      setShake(true)
      return
    }

    setError(null)
    setShake(false)
    setIsLoading(true)

    try {
      const { role, name } = await apiLogin(normalizedUsername, normalizedPassword)
      login(role, name)
      if (!rememberMe) {
        setPassword('')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bağlantı hatası'
      setError(message)
      setShake(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#07090f] px-s4 py-s16 text-[#e6edf5]">
      <div className="glass-card mx-auto w-full max-w-md p-8">
        <div className="mb-s8 space-y-s3">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-[#6f859f]">WEN Nexus Güvenli Erişim</p>
          <h1 className="font-display text-5xl leading-none text-[#e6edf5]">Sisteme Giriş</h1>
          <p className="text-sm text-[#92a5bd]">Su-Enerji karar destek ekranlarına erişmek için kimlik doğrulaması yapın.</p>
        </div>

        <form className={shake ? 'login-shake space-y-s5' : 'space-y-s5'} onSubmit={handleSubmit} onAnimationEnd={() => setShake(false)}>
          <label className="block space-y-s2">
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#7890ac]">Kullanıcı Adı</span>
            <div
              className={`flex items-center gap-s2 rounded-md border bg-[#101b2a] px-s3 ${
                error ? 'border-red-500/70' : 'border-[#263a54] focus-within:border-[#22a7d8]'
              }`}
            >
              <User className="h-4 w-4 text-[#6f859f]" aria-hidden />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="kullanici@bosb.gov.tr"
                className="h-11 w-full bg-transparent text-sm text-[#e6edf5] placeholder:text-[#5d728d] focus:outline-none"
              />
            </div>
          </label>

          <label className="block space-y-s2">
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#7890ac]">Şifre</span>
            <div
              className={`flex items-center gap-s2 rounded-md border bg-[#101b2a] px-s3 ${
                error ? 'border-red-500/70' : 'border-[#263a54] focus-within:border-[#22a7d8]'
              }`}
            >
              <Lock className="h-4 w-4 text-[#6f859f]" aria-hidden />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Şifrenizi girin"
                className="h-11 w-full bg-transparent text-sm text-[#e6edf5] placeholder:text-[#5d728d] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((state) => !state)}
                className="text-[#6f859f] transition hover:text-[#22a7d8]"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-s3">
            <label className="inline-flex items-center gap-s2 text-sm text-[#9ab1c9]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-[#2f445e] bg-[#101b2a] accent-[#22a7d8]"
              />
              Beni hatırla
            </label>
            <button
              type="button"
              onClick={() => setShowSupportMessage(true)}
              className="text-sm text-[#22a7d8] transition hover:text-[#55c3ea]"
            >
              Şifremi unuttum
            </button>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-12 w-full bg-[#22a7d8] text-[#04111a] hover:bg-[#40b8e4] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-s2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#083146] border-t-transparent" />
                Yükleniyor...
              </span>
            ) : (
              <span className="inline-flex items-center gap-s2">
                <Waves className="h-4 w-4" />
                Giriş Yap
              </span>
            )}
          </Button>
        </form>

      </div>

      {showSupportMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-s4">
          <div className="w-full max-w-sm rounded-xl border border-[#27405d] bg-[#0f1622] p-s6 text-center shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
            <h2 className="mb-s3 font-display text-3xl text-[#e6edf5]">Şifre Desteği</h2>
            <p className="text-sm text-[#9fb4cb]">Lütfen sistem yöneticisi ile iletişime geçin.</p>
            <Button type="button" className="mt-s5 w-full bg-[#22a7d8] text-[#04111a] hover:bg-[#40b8e4]" onClick={() => setShowSupportMessage(false)}>
              Kapat
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
