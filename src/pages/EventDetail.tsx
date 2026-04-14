import { useParams, Navigate, Link } from 'react-router-dom'
import { MapPin, Clock, ArrowLeft, Check, Star, Users, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useEvent, useEventRsvps, useUpsertRsvp } from '@/hooks/useEvents'
import Navbar from '@/components/Navbar'
import { getFriendsGoing } from '@/lib/demo-data'

const CAT_LABELS: Record<string, string> = {
  festival:'Festival', club_night:'Club Night', gig:'Gig', party:'Party',
  arts:'Arts', sport:'Sport', uni:'Uni Event', tour_date:'Tour Date',
  market:'Market', workshop:'Workshop', other:'Event',
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday:'long', day:'numeric', month:'long', hour:'numeric', minute:'2-digit', hour12:true
  })
}

export default function EventDetail() {
  const { id }   = useParams<{ id: string }>()
  const { user, isDemo } = useAuth()
  const { data: event, isLoading } = useEvent(id!)
  const { data: rsvps = [] }       = useEventRsvps(id!)
  const upsert   = useUpsertRsvp()

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
  if (!user)  return <Navigate to="/login" replace />
  if (!event) return <p className="p-8 text-center text-muted-foreground">Event not found</p>

  const goingCount = rsvps.filter(r => r.status === 'going').length
  const intCount   = rsvps.filter(r => r.status === 'interested').length
  const myRsvp     = rsvps.find(r => r.user_id === user.id)
  const friendsGoing = isDemo ? getFriendsGoing(event.id, 'user-alexei') : []
  const price = event.price_min === 0 ? 'Free'
    : event.price_max && event.price_max !== event.price_min
      ? `$${event.price_min}–$${event.price_max}`
      : event.price_min ? `$${event.price_min}` : null

  const handleRsvp = (status: 'going' | 'interested') =>
    upsert.mutate({ eventId: event.id, userId: user.id, status })

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="relative">
        <img src={event.image_url || '/corral/icons/icon-512.png'} alt={event.title}
          className="h-64 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link to="/" className="absolute left-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute left-4 bottom-4 rounded-lg bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
          {CAT_LABELS[event.category] ?? 'Event'}
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {event.tags.map(t => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Tag size={9} />#{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Clock size={15} />{fmtDateTime(event.starts_at)}</div>
          {event.location_name && <div className="flex items-center gap-2"><MapPin size={15} />{event.location_name}{event.suburb ? `, ${event.suburb}` : ''}</div>}
          <div className="flex items-center gap-2"><Users size={15} />{goingCount} going · {intCount} interested</div>
          {price && <p className="font-semibold text-primary">{price}</p>}
        </div>

        {/* Friends going */}
        {friendsGoing.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {friendsGoing.slice(0,4).map(f => (
                <div key={f.id} className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-background">
                  {f.initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {friendsGoing.slice(0,2).map(f => f.display_name.split(' ')[0]).join(' and ')} {friendsGoing.length > 2 ? `+ ${friendsGoing.length - 2} more` : ''} going
            </p>
          </div>
        )}

        {event.description && <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>}

        {event.ticket_url && (
          <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
            className="block w-full rounded-xl border border-primary py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
            Get tickets →
          </a>
        )}

        <div className="flex gap-3">
          <button onClick={() => handleRsvp('going')} disabled={upsert.isPending}
            className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50',
              myRsvp?.status === 'going' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
            <Check size={16} />Going
          </button>
          <button onClick={() => handleRsvp('interested')} disabled={upsert.isPending}
            className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50',
              myRsvp?.status === 'interested' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
            <Star size={16} />Interested
          </button>
        </div>
      </div>
    </div>
  )
}
