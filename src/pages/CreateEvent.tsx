import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateEvent } from '@/hooks/useEvents'
import Navbar from '@/components/Navbar'

const inputCls = 'w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

export default function CreateEvent() {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()
  const createEvent       = useCreateEvent()

  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '',
    location: '', price: '', image_url: '', tags: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createEvent.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        date: form.date,
        time: form.time || undefined,
        location: form.location || undefined,
        price: form.price ? parseFloat(form.price) : null,
        image_url: form.image_url || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()) : undefined,
        created_by: user.id,
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
          {/* Image drop zone */}
          <div className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary">
            <ImagePlus size={28} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add event photo</span>
          </div>

          <input type="text"   placeholder="Event title *" required value={form.title}       onChange={set('title')}       className={inputCls} />
          <textarea            placeholder="Description"            value={form.description} onChange={set('description')} className={`${inputCls} resize-none`} rows={3} />

          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.date} onChange={set('date')} className={inputCls} />
            <input type="time"          value={form.time} onChange={set('time')} className={inputCls} />
          </div>

          <input type="text"   placeholder="Location / Venue"                      value={form.location}  onChange={set('location')}  className={inputCls} />
          <input type="number" placeholder="Ticket price (leave blank if free)"    value={form.price}     onChange={set('price')}     className={inputCls} />
          <input type="text"   placeholder="Tags — comma separated: music, doof…"  value={form.tags}      onChange={set('tags')}      className={inputCls} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={createEvent.isPending}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {createEvent.isPending ? 'Posting…' : 'Post event'}
          </button>
        </form>
      </main>
    </div>
  )
}
