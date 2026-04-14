import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Phone, ArrowRight, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// ── Phone-first OTP login ─────────────────────────────────────────────────────
// Step 1: enter phone number → OTP sent via SMS
// Step 2: enter 6-digit OTP → logged in
// No email, no password, no username needed at this stage.

const COUNTRY_CODES = [
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+64', flag: '🇳🇿', label: 'NZ' },
  { code: '+1',  flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
]

type Step = 'phone' | 'otp' | 'done'

export default function Login() {
  const { user, sendOtp, verifyOtp } = useAuth()

  const [step, setStep]           = useState<Step>('phone')
  const [countryCode, setCC]      = useState('+61')
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [busy, setBusy]           = useState(false)
  const [resendCooldown, setCooldown] = useState(0)

  if (user) return <Navigate to="/" replace />

  const fullPhone = countryCode + phone.replace(/\D/g, '')

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setError(null)
    setBusy(true)
    const { error } = await sendOtp(fullPhone)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('otp')
    // 60 second resend cooldown
    setCooldown(60)
    const t = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0 }
        return c - 1
      })
    }, 1000)
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    setError(null)
    setBusy(true)
    const { error } = await verifyOtp(fullPhone, otp)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('done')
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(null)
    setBusy(true)
    const { error } = await sendOtp(fullPhone)
    setBusy(false)
    if (error) { setError(error.message); return }
    setCooldown(60)
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 })
    }, 1000)
  }

  const inputCls = 'w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-primary">corral</h1>
          <p className="mt-2 text-sm text-muted-foreground">Find your people. Find your events.</p>
        </div>

        {/* ── Step 1: Phone entry ─────────────────────────────────────────── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Your mobile number</p>
              <div className="flex gap-2">
                {/* Country code picker */}
                <select
                  value={countryCode}
                  onChange={e => setCC(e.target.value)}
                  className="rounded-xl border border-border bg-secondary px-3 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors shrink-0"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
                {/* Phone number */}
                <input
                  type="tel"
                  placeholder="0412 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  autoFocus
                  inputMode="numeric"
                  className={cn(inputCls, 'flex-1')}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                We'll send a 6-digit code to verify your number.
              </p>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <button
              type="submit"
              disabled={busy || !phone.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {busy ? <RefreshCw size={16} className="animate-spin" /> : <Phone size={16} />}
              {busy ? 'Sending…' : 'Send code'}
              {!busy && <ArrowRight size={16} />}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to Corral's terms. Standard SMS rates may apply.
            </p>
          </form>
        )}

        {/* ── Step 2: OTP entry ───────────────────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Code sent to</p>
              <p className="text-base font-bold text-primary">
                {countryCode} {phone}
              </p>
              <p className="text-xs text-muted-foreground">Enter the 6-digit code from your SMS.</p>
            </div>

            {/* OTP input — big digits */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
              className="w-full rounded-xl border border-border bg-secondary px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-foreground outline-none focus:border-primary transition-colors"
            />

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <button
              type="submit"
              disabled={busy || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {busy ? <RefreshCw size={16} className="animate-spin" /> : null}
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>

            {/* Resend + change number */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
                className="hover:text-foreground transition-colors"
              >
                ← Change number
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={cn(
                  'transition-colors',
                  resendCooldown > 0 ? 'opacity-40 cursor-default' : 'hover:text-foreground'
                )}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: done (brief, then redirects via user state) ─────────── */}
        {step === 'done' && (
          <div className="text-center space-y-3 py-8">
            <div className="text-4xl">🎉</div>
            <p className="font-semibold text-foreground">You're in.</p>
            <p className="text-sm text-muted-foreground">Taking you to your feed…</p>
          </div>
        )}

      </div>
    </div>
  )
}
