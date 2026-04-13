import { Navigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

export default function Profile() {
  const { user, loading, signOut } = useAuth()

  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />

  const initials = user.email?.[0].toUpperCase() ?? '?'
  const memberSince = new Date(user.created_at ?? Date.now())
    .toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <button className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Avatar card */}
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{user.email}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Going',      value: '—' },
            { label: 'Interested', value: '—' },
            { label: 'Friends',    value: '—' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card py-4 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors"
        >
          <LogOut size={16} />Sign out
        </button>
      </main>
    </div>
  )
}
