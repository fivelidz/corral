import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FeedPost, RsvpStatus } from '@/types'

const CAT_EMOJI: Record<string, string> = {
  festival:'🎪', club_night:'🎵', gig:'🎸', party:'🎉',
  arts:'🎨', sport:'⚽', uni:'🎓', tour_date:'🎤',
  market:'🛍️', workshop:'🔧', other:'📅',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { weekday:'short', day:'numeric', month:'short' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour:'numeric', minute:'2-digit', hour12:true })
}
function fmtPrice(min?: number, max?: number) {
  if (min === undefined || min === null) return null
  if (min === 0) return 'Free'
  return max && max !== min ? `$${min}–$${max}` : `$${min}`
}

export default function EventCard({
  id, image, title, starts_at, location_name, suburb,
  category, going_count, interested_count, friends_going,
  price_min, my_rsvp,
}: FeedPost) {
  const [rsvp, setRsvp] = useState<RsvpStatus | undefined>(my_rsvp)
  const price = fmtPrice(price_min)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-transform active:scale-[0.99]">
      <Link to={`/event/${id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = '/corral/icons/icon-192.png' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3 rounded-lg bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {CAT_EMOJI[category] ?? '📅'} {fmtDate(starts_at)}
          </div>
          {price && (
            <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {price}
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-2 px-4 py-3">
        <Link to={`/event/${id}`}>
          <h2 className="text-base font-semibold leading-snug text-foreground hover:text-primary transition-colors">{title}</h2>
        </Link>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock size={11} />{fmtTime(starts_at)}</span>
          {(location_name || suburb) && <span className="flex items-center gap-1"><MapPin size={11} />{location_name || suburb}</span>}
          <span className="flex items-center gap-1"><Users size={11} />{going_count} going · {interested_count} interested</span>
        </div>
        {friends_going.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex -space-x-1.5">
              {friends_going.slice(0, 4).map(f => (
                <div key={f.id} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-card">
                  {f.initials}
                </div>
              ))}
            </div>
            <span>{friends_going.slice(0,2).map(f => f.display_name.split(' ')[0]).join(', ')} going</span>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={() => setRsvp(rsvp === 'going' ? undefined : 'going')}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
              rsvp === 'going' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
            <Check size={13} strokeWidth={2.5} />Going
          </button>
          <button onClick={() => setRsvp(rsvp === 'interested' ? undefined : 'interested')}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
              rsvp === 'interested' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
            <Star size={13} strokeWidth={2.5} />Interested
          </button>
        </div>
      </div>
    </article>
  )
}
