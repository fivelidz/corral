import { Navigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

export default function Notifications() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Notifications</h1>
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Bell size={36} strokeWidth={1.2} />
          <p className="text-sm">No notifications yet.</p>
        </div>
      </main>
    </div>
  )
}
