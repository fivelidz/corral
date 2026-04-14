import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/EventCard'
import SearchAndFilters from '@/components/SearchAndFilters'
import DemoBanner from '@/components/DemoBanner'
import { useEvents, useRsvps } from '@/hooks/useEvents'
import type { FeedPost } from '@/types'

export default function Discover() {
  const { user, loading, isDemo } = useAuth()
  const { data: events = [], isLoading } = useEvents()
  const { data: rsvps = [] } = useRsvps()

  const posts: FeedPost[] = useMemo(() => events.map(event => {
    const evRsvps = rsvps.filter(r => r.event_id === event.id)
    return {
      id: event.id,
      image: event.image_url || '/corral/icons/icon-512.png',
      title: event.title,
      starts_at: event.starts_at,
      location_name: event.location_name || '',
      suburb: event.suburb,
      category: event.category,
      tags: event.tags,
      price_min: event.price_min,
      price_max: event.price_max,
      going_count: evRsvps.filter(r => r.status === 'going').length,
      interested_count: evRsvps.filter(r => r.status === 'interested').length,
      friends_going: [],
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
          <p className="mt-1 text-sm text-muted-foreground">All events — festivals, parties, gigs, tours and more.</p>
        </div>
        <SearchAndFilters />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5">{posts.map(p => <EventCard key={p.id} {...p} />)}</div>
        )}
      </main>
    </div>
  )
}
