import { useParams, Navigate, Link } from 'react-router-dom'
import { MapPin, Clock, ArrowLeft, Check, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useEvent, useEventRsvps, useUpsertRsvp } from '@/hooks/useEvents'
import Navbar from '@/components/Navbar'
import { formatDate, formatTime } from '@/lib/utils'

export default function EventDetail() {
  const { id }    = useParams<{ id: string }>()
  const { user }  = useAuth()
  const { data: event, isLoading } = useEvent(id!)
  const { data: rsvps = [] }       = useEventRsvps(id!)
  const upsert    = useUpsertRsvp()

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )

  if (!user)   return <Navigate to="/login" replace />
  if (!event)  return <p className="p-8 text-center text-muted-foreground">Event not found</p>

  const goingCount = rsvps.filter(r => r.status === 'going').length
  const intCount   = rsvps.filter(r => r.status === 'interested').length
  const myRsvp     = rsvps.find(r => r.user_id === user.id)

  const handleRsvp = (status: 'going' | 'interested') =>
    upsert.mutate({ eventId: event.id, userId: user.id, status })

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero */}
      <div className="relative">
        <img
          src={event.image_url || '/placeholder.svg'}
          alt={event.title}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link
          to="/"
          className="absolute left-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5">

        {/* Title + tags */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {event.tags.map(t => (
                <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock size={15} />
            {formatDate(event.date)}{event.time ? ` · ${formatTime(event.time)}` : ''}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={15} />{event.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users size={15} />{goingCount} going · {intCount} interested
          </div>
          {event.price != null && (
            <p className="font-semibold text-primary">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </p>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
        )}

        {/* RSVP */}
        <div className="flex gap-3">
          <button
            onClick={() => handleRsvp('going')}
            disabled={upsert.isPending}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50',
              myRsvp?.status === 'going'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            <Check size={16} />Going
          </button>
          <button
            onClick={() => handleRsvp('interested')}
            disabled={upsert.isPending}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50',
              myRsvp?.status === 'interested'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            <Star size={16} />Interested
          </button>
        </div>
      </div>
    </div>
  )
}
