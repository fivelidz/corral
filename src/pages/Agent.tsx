import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, Bot, User, ArrowLeft, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IS_DEMO } from '@/lib/demo-data'

interface Message {
  id:   string
  role: 'user' | 'agent'
  text: string
  ts:   Date
}

const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? ''

// ── Demo responses ────────────────────────────────────────────────────────────
const REPLIES: [RegExp, string][] = [
  [/hello|hey|hi|hiya/i,          'Hey! Good to hear from you. I can tell you what\'s on, who\'s going, or help post an event. What do you need?'],
  [/what.*(on|happen)|tonight|weekend|this week/i, 'A few things coming up: doof in the Yarra Valley Friday, queer club night Saturday, free jazz in Fitzroy Sunday, and the Corral launch party next week. Want details on any of them?'],
  [/who.*going|friends/i,          'Jade K and Max L are both going to the Dusk til Dawn doof. Sadiya R is going to the jazz session Sunday.'],
  [/free/i,                        'Free events this week: Sunday jazz session in Fitzroy Gardens (14:00) and the Corral launch party (free entry). Both solid.'],
  [/doof|psytrance|trance/i,       'Dusk til Dawn is the pick — 12hrs open air, Yarra Valley, Friday 6pm. $35. Bring layers.'],
  [/help|what can/i,               'I can: find events, tell you who\'s going, recommend things by vibe, help post a new event, or just chat about the scene.'],
]

function demoReply(input: string): string {
  for (const [re, reply] of REPLIES) {
    if (re.test(input)) return reply
  }
  return 'I\'m the Corral agent — not fully wired up yet but I\'ll be able to find events, check who\'s going, and act on your behalf once connected. Ask me anything about the demo data for now.'
}

async function sendMessage(text: string): Promise<string> {
  if (IS_DEMO || !AGENT_URL) {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700))
    return demoReply(text)
  }
  const res = await fetch(AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  return data.reply ?? data.message ?? '…'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'agent', ts: new Date(),
    text: 'Hey 👋 I\'m the Corral agent.\n\nI can find events, tell you what\'s on this week, check who\'s going, or help you post something. What do you want to know?',
  }])
  const [input, setInput]   = useState('')
  const [busy, setBusy]     = useState(false)
  const bottomRef           = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMessages(m => [...m, { id: `u${Date.now()}`, role: 'user', text, ts: new Date() }])
    setBusy(true)
    try {
      const reply = await sendMessage(text)
      setMessages(m => [...m, { id: `a${Date.now()}`, role: 'agent', text: reply, ts: new Date() }])
    } catch {
      setMessages(m => [...m, { id: `e${Date.now()}`, role: 'agent', text: 'Something went wrong. Try again.', ts: new Date() }])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const QUICK = ["What's on this week?", "Who's going tonight?", "Any free events?", "Best doof coming up?"]

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground">Corral Agent</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{IS_DEMO ? 'Demo mode' : 'Online'}</p>
            </div>
          </div>
          {IS_DEMO && (
            <div className="ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary">
              <Zap size={11} />Demo
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-4 pb-36">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={cn(
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              msg.role === 'agent' ? 'bg-primary/20' : 'bg-secondary',
            )}>
              {msg.role === 'agent'
                ? <Bot  size={14} className="text-primary" />
                : <User size={14} className="text-muted-foreground" />
              }
            </div>
            <div className="max-w-[78%]">
              <div className={cn(
                'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'agent'
                  ? 'border border-border bg-card text-foreground'
                  : 'bg-primary text-primary-foreground',
              )}>
                {msg.text}
              </div>
              <p className={cn(
                'mt-1 px-1 text-xs text-muted-foreground',
                msg.role === 'user' && 'text-right',
              )}>
                {msg.ts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
              {[0,1,2].map(i => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Quick prompts */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
        <div className="scrollbar-none mx-auto flex max-w-2xl gap-2 overflow-x-auto pb-1">
          {QUICK.map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); inputRef.current?.focus() }}
              className="shrink-0 whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about events, friends, what's on…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
