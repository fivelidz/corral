import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { IS_DEMO, DEMO_USER } from '@/lib/demo-data'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// ── Phone-first auth ──────────────────────────────────────────────────────────
// Primary identity = mobile number. OTP via SMS (Twilio) or WhatsApp.
// No email/password. Session persists 30 days.
// In demo mode: auto-logged in as demo user, no OTP needed.

interface AuthContextType {
  user:         SupabaseUser | null
  session:      Session | null
  loading:      boolean
  isDemo:       boolean
  // Phone OTP flow — step 1: send OTP
  sendOtp:      (phone: string) => Promise<{ error: Error | null }>
  // Phone OTP flow — step 2: verify OTP
  verifyOtp:    (phone: string, token: string) => Promise<{ error: Error | null }>
  signOut:      () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<SupabaseUser | null>(
    IS_DEMO ? (DEMO_USER as unknown as SupabaseUser) : null
  )
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!IS_DEMO)

  useEffect(() => {
    if (IS_DEMO) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Step 1: send OTP to phone number
  const sendOtp = async (phone: string) => {
    if (IS_DEMO) return { error: null }
    // Normalise: ensure E.164 format (+61412345678)
    const normalised = normalisePhone(phone)
    const { error } = await supabase.auth.signInWithOtp({ phone: normalised })
    return { error: error as Error | null }
  }

  // Step 2: verify OTP and sign in / create account
  const verifyOtp = async (phone: string, token: string) => {
    if (IS_DEMO) {
      setUser(DEMO_USER as unknown as SupabaseUser)
      return { error: null }
    }
    const normalised = normalisePhone(phone)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalised,
      token,
      type: 'sms',
    })
    if (!error && data.user) {
      setUser(data.user)
      setSession(data.session)
    }
    return { error: error as Error | null }
  }

  const signOut = async () => {
    if (IS_DEMO) { setUser(null); return }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo: IS_DEMO, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalise a phone number to E.164 format.
 * Handles: 0412345678 → +61412345678
 *          61412345678 → +61412345678
 *          +61412345678 → +61412345678
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // Australian mobile starting with 0
  if (digits.startsWith('0') && digits.length === 10) {
    return '+61' + digits.slice(1)
  }
  // Already has country code without +
  if (digits.startsWith('61') && digits.length === 11) {
    return '+' + digits
  }
  // Already E.164 or other international
  if (raw.startsWith('+')) return raw
  return '+' + digits
}

/**
 * Format phone number for display: +61412345678 → 0412 345 678
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('61') && digits.length === 11) {
    const local = '0' + digits.slice(2)
    return `${local.slice(0,4)} ${local.slice(4,7)} ${local.slice(7)}`
  }
  return phone
}
