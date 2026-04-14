import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ImagePlus, Lock, Globe, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateEvent } from '@/hooks/useEvents'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'
import type { EventCategory, EventVisibility } from '@/types'

const inputCls = 'w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

const CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: 'festival',   label: 'Festival',    emoji: '🎪' },
  { value: 'club_night', label: 'Club Night',  emoji: '🎵' },
  { value: 'gig',        label: 'Gig',         emoji: '🎸' },
  { value: 'party',      label: 'Party',       emoji: '🎉' },
  { value: 'arts',       label: 'Arts',        emoji: '🎨' },
  { value: 'uni',        label: 'Uni Event',   emoji: '🎓' },
  { value: 'tour_date',  label: 'Tour Date',   emoji: '🎤' },
  { value: 'sport',      label: 'Sport',       emoji: '⚽' },
  { value: 'market',     label: 'Market',      emoji: '🛍️' },
  { value: 'other',      label: 'Other',       emoji: '📅' },
]

const VISIBILITY: { value: EventVisibility; label: string; desc: string; icon: typeof Globe }[] = [
  { value: 'public',  label: 'Public',       desc: 'Anyone on Corral',    icon: Globe },
  { value: 'friends', label: 'Friends only', desc: 'Your followers',      icon: Users },
  { value: 'invite',  label: 'Invite only',  desc: 'Only people you invite', icon: Lock },
]

export default function CreateEvent() {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()
  const createEvent       = useCreateEvent()

  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '',
    location_name: '', suburb: '', price_min: '', price_max: '',
    ticket_url: '', tags: '', image_url: '',
    category: 'party' as EventCategory,
    visibility: 'public' as EventVisibility,
  })
  const [error, setError] = useState<string | null>(null)

  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const starts_at = form.date && form.time
        ? new Date(`${form.date}T${form.time}`).toISOString()
        : form.date ? new Date(form.date).toISOString() : new Date().toISOString()
      await createEvent.mutateAsync({
        created_by:    user.id,
        title:         form.title,
        description:   form.description || undefined,
        starts_at,
        location_name: form.location_name || undefined,
        suburb:        form.suburb || undefined,
        price_min:     form.price_min ? parseFloat(form.price_min) : 0,
        price_max:     form.price_max ? parseFloat(form.price_max) : undefined,
        ticket_url:    form.ticket_url || undefined,
        tags:          form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()) : undefined,
        image_url:     form.image_url || undefined,
        category:      form.category,
        visibility:    form.visibility,
        city:          'Sydney',
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Post an event</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary">
            <ImagePlus size={28} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add event photo</span>
          </div>

          <input type="text" placeholder="Event title *" required value={form.title} onChange={set('title')} className={inputCls} />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={set('description')} className={`${inputCls} resize-none`} />

          {/* Category */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))}
                  className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + time */}
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.date} onChange={set('date')} className={inputCls} />
            <input type="time"          value={form.time} onChange={set('time')} className={inputCls} />
          </div>

          <input type="text" placeholder="Venue / Location name" value={form.location_name} onChange={set('location_name')} className={inputCls} />
          <input type="text" placeholder="Suburb" value={form.suburb} onChange={set('suburb')} className={inputCls} />

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Price from ($)" value={form.price_min} onChange={set('price_min')} className={inputCls} />
            <input type="number" placeholder="Price up to ($)" value={form.price_max} onChange={set('price_max')} className={inputCls} />
          </div>

          <input type="url" placeholder="Ticket URL (optional)" value={form.ticket_url} onChange={set('ticket_url')} className={inputCls} />
          <input type="text" placeholder="Tags — comma separated: doof, techno, free…" value={form.tags} onChange={set('tags')} className={inputCls} />

          {/* Visibility */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Who can see this?</p>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY.map(v => {
                const Icon = v.icon
                return (
                  <button key={v.value} type="button" onClick={() => setForm(f => ({ ...f, visibility: v.value }))}
                    className={cn('flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-all border',
                      form.visibility === v.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground')}>
                    <Icon size={16} />
                    <span>{v.label}</span>
                    <span className="text-[10px] opacity-70">{v.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={createEvent.isPending}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50">
            {createEvent.isPending ? 'Posting…' : 'Post event'}
          </button>
        </form>
      </main>
    </div>
  )
}
