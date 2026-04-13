import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/EventCard'
import SearchAndFilters from '@/components/SearchAndFilters'
import DemoBanner from '@/components/DemoBanner'
import { useEvents, useRsvps } from '@/hooks/useEvents'

export default function Discover() {
  const { user, loading, isDemo } = useAuth()
  const { data: events = [], isLoading } = useEvents()
  const { data: rsvps = [] } = useRsvps()

  const posts = useMemo(() => events.map(event => {
    const evRsvps    = rsvps.filter(r => r.event_id === event.id)
    const goingCount = evRsvps.filter(r => r.status === 'going').length
    return {
      id: event.id,
      image: event.image_url || '/placeholder.svg',
      title: event.title,
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      attending: goingCount,
      friendsGoing: [] as { id: string; initials: string; name: string }[],
      goingCount,
      interestedCount: evRsvps.filter(r => r.status === 'interested').length,
      tags: event.tags,
      price: event.price,
    }
  }), [events, rsvps])

  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      {isDemo && <DemoBanner />}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Discover</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore what's happening around you.</p>
        </div>

        <SearchAndFilters />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(p => <EventCard key={p.id} {...p} />)}
          </div>
        )}
      </main>
    </div>
  )
}
