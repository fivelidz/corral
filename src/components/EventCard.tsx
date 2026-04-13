import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import type { FeedPost } from '@/types'

export default function EventCard({
  id, image, title, date, time, location,
  goingCount, interestedCount, friendsGoing,
}: FeedPost) {
  const [rsvp, setRsvp] = useState<'going' | 'interested' | null>(null)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-transform active:scale-[0.99]">

      {/* Image */}
      <Link to={`/event/${id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3 rounded-lg bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {formatDate(date)}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="space-y-2 px-4 py-3">
        <Link to={`/event/${id}`}>
          <h2 className="text-base font-semibold leading-snug text-foreground hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {time && (
            <span className="flex items-center gap-1">
              <Clock size={11} />{formatTime(time)}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />{location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={11} />{goingCount} going · {interestedCount} interested
          </span>
        </div>

        {/* Friends going */}
        {friendsGoing.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex -space-x-1.5">
              {friendsGoing.slice(0, 4).map(f => (
                <div
                  key={f.id}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-card"
                >
                  {f.initials}
                </div>
              ))}
            </div>
            <span>{friendsGoing.slice(0, 2).map(f => f.name.split(' ')[0]).join(', ')} going</span>
          </div>
        )}

        {/* RSVP */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setRsvp(rsvp === 'going' ? null : 'going')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
              rsvp === 'going'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            <Check size={13} strokeWidth={2.5} />Going
          </button>
          <button
            onClick={() => setRsvp(rsvp === 'interested' ? null : 'interested')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
              rsvp === 'interested'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            <Star size={13} strokeWidth={2.5} />Interested
          </button>
        </div>
      </div>
    </article>
  )
}
