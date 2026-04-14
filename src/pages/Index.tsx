import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import SearchAndFilters from '@/components/SearchAndFilters'
import EventCard from '@/components/EventCard'
import DemoBanner from '@/components/DemoBanner'
import { useEvents, useRsvps } from '@/hooks/useEvents'
import { getFriendsGoing } from '@/lib/demo-data'
import type { FeedPost } from '@/types'

export default function Index() {
  const { user, loading, isDemo } = useAuth()
  const { data: events = [], isLoading } = useEvents()
  const { data: rsvps = [] } = useRsvps()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')

  const posts: FeedPost[] = useMemo(() => {
    let list = events

    if (q) {
      const lq = q.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(lq) ||
        e.location_name?.toLowerCase().includes(lq) ||
        e.suburb?.toLowerCase().includes(lq) ||
        e.description?.toLowerCase().includes(lq)
      )
    }

    if (filter === 'Tonight') {
      const today = new Date().toISOString().split('T')[0]
      list = list.filter(e => e.starts_at.startsWith(today))
    } else if (filter === 'This Week') {
      const week = new Date(Date.now() + 7 * 86400000)
      list = list.filter(e => new Date(e.starts_at) <= week)
    } else if (filter === 'Free') {
      list = list.filter(e => !e.price_min || e.price_min === 0)
    } else if (filter === 'Doof') {
      list = list.filter(e => e.tags?.some(t => ['doof','psytrance'].includes(t)) || e.category === 'festival')
    } else if (filter === 'Music') {
      list = list.filter(e => ['club_night','gig','festival','tour_date'].includes(e.category))
    } else if (filter === 'Art') {
      list = list.filter(e => e.category === 'arts')
    } else if (filter === 'Sport') {
      list = list.filter(e => e.category === 'sport')
    }

    return list.map(event => {
      const evRsvps      = rsvps.filter(r => r.event_id === event.id)
      const going_count  = evRsvps.filter(r => r.status === 'going').length
      const int_count    = evRsvps.filter(r => r.status === 'interested').length
      const friends_going = isDemo
        ? getFriendsGoing(event.id, 'user-alexei')
        : []

      return {
        id:               event.id,
        image:            event.image_url || '/corral/icons/icon-512.png',
        title:            event.title,
        starts_at:        event.starts_at,
        location_name:    event.location_name || '',
        suburb:           event.suburb,
        category:         event.category,
        tags:             event.tags,
        price_min:        event.price_min,
        price_max:        event.price_max,
        going_count,
        interested_count: int_count,
        friends_going,
      }
    })
  }, [events, rsvps, q, filter, isDemo])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      {isDemo && <DemoBanner />}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your friends are going out</h1>
          <p className="mt-1 text-sm text-muted-foreground">See what your people are up to this week.</p>
        </div>
        <SearchAndFilters onSearch={setQ} onFilter={setFilter} />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-medium text-foreground">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {q ? 'Try a different search' : 'Events from people you follow will appear here'}
            </p>
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
