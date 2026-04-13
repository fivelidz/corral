import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import SearchAndFilters from '@/components/SearchAndFilters'
import EventCard from '@/components/EventCard'
import DemoBanner from '@/components/DemoBanner'
import { useEvents, useRsvps } from '@/hooks/useEvents'
import { DEMO_FRIENDS } from '@/lib/demo-data'

export default function Index() {
  const { user, loading, isDemo } = useAuth()
  const { data: events = [], isLoading } = useEvents()
  const { data: rsvps = [] }            = useRsvps()
  const [q, setQ]                       = useState('')
  const [filter, setFilter]             = useState('All')

  const posts = useMemo(() => {
    let list = events

    if (q) {
      const lq = q.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(lq) ||
        e.location?.toLowerCase().includes(lq) ||
        e.description?.toLowerCase().includes(lq),
      )
    }

    if (filter === 'Tonight') {
      const today = new Date().toISOString().split('T')[0]
      list = list.filter(e => e.date === today)
    } else if (filter === 'This Week') {
      const week = new Date(Date.now() + 7 * 86400000)
      list = list.filter(e => new Date(e.date) <= week)
    } else if (filter === 'Free') {
      list = list.filter(e => !e.price || e.price === 0)
    } else if (filter !== 'All') {
      list = list.filter(e => e.tags?.includes(filter.toLowerCase()))
    }

    return list.map(event => {
      const evRsvps      = rsvps.filter(r => r.event_id === event.id)
      const goingCount   = evRsvps.filter(r => r.status === 'going').length
      const intCount     = evRsvps.filter(r => r.status === 'interested').length
      const friendsGoing = isDemo
        ? DEMO_FRIENDS.filter(f => evRsvps.some(r => r.user_id === f.id)).slice(0, 3)
        : []

      return {
        id: event.id,
        image: event.image_url || '/placeholder.svg',
        title: event.title,
        date: event.date,
        time: event.time || '',
        location: event.location || '',
        attending: goingCount,
        friendsGoing,
        goingCount,
        interestedCount: intCount,
        tags: event.tags,
        price: event.price,
      }
    })
  }, [events, rsvps, q, filter, isDemo])

  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      {isDemo && <DemoBanner />}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your friends are going out
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See what your people are up to this week.
          </p>
        </div>

        <SearchAndFilters onSearch={setQ} onFilter={setFilter} />

        {isLoading ? (
          <Spinner />
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

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
