import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildSocialGraph, DEMO_EVENTS, DEMO_RSVPS } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { GraphNode, GraphEdge } from '@/types'

// ── Colours ───────────────────────────────────────────────────────────────────
const SELF_COLOUR    = 'oklch(65% 0.18 300)'   // purple — you
const FRIEND_COLOUR  = 'oklch(65% 0.18 220)'   // blue — mutual friend
const FOLLOW_COLOUR  = 'oklch(60% 0.15 160)'   // teal — one-way follow
const FOF_COLOUR     = 'oklch(50% 0.08 0)'     // grey — friend of friend
const SHARED_EDGE    = 'rgba(255, 160, 0, 0.8)' // amber — shared event
const FRIEND_EDGE    = 'rgba(140, 100, 255, 0.5)' // purple — mutual
const FOLLOW_EDGE    = 'rgba(80, 160, 200, 0.3)'  // blue — follow

// ── Force-directed layout (simple spring algorithm) ───────────────────────────
interface NodePos { id: string; x: number; y: number; vx: number; vy: number }

function layoutNodes(nodes: GraphNode[], edges: GraphEdge[], W: number, H: number): NodePos[] {
  const cx = W / 2, cy = H / 2
  const positions: NodePos[] = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2
    const radius = n.is_self ? 0 : 120 + Math.random() * 80
    return {
      id: n.id,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: 0, vy: 0,
    }
  })

  // Run 200 iterations of force simulation
  for (let iter = 0; iter < 200; iter++) {
    const cooling = 1 - iter / 200

    // Repulsion between all nodes
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (80 * 80) / dist * cooling * 0.5
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        positions[i].vx -= fx; positions[i].vy -= fy
        positions[j].vx += fx; positions[j].vy += fy
      }
    }

    // Attraction along edges
    edges.forEach(e => {
      const src = positions.find(p => p.id === e.source)
      const tgt = positions.find(p => p.id === e.target)
      if (!src || !tgt) return
      const dx = tgt.x - src.x, dy = tgt.y - src.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const ideal = e.type === 'friend' ? 140 : 180
      const force = (dist - ideal) * 0.03 * cooling
      const fx = (dx / dist) * force, fy = (dy / dist) * force
      src.vx += fx; src.vy += fy
      tgt.vx -= fx; tgt.vy -= fy
    })

    // Centre gravity — pull toward centre
    positions.forEach(p => {
      p.vx += (cx - p.x) * 0.005
      p.vy += (cy - p.y) * 0.005
    })

    // Apply velocity + damping
    positions.forEach(p => {
      if (nodes.find(n => n.id === p.id)?.is_self) {
        // Self is pinned to centre
        p.x = cx; p.y = cy; p.vx = 0; p.vy = 0
        return
      }
      p.x += p.vx; p.y += p.vy
      p.vx *= 0.7; p.vy *= 0.7
      // Clamp to canvas
      p.x = Math.max(40, Math.min(W - 40, p.x))
      p.y = Math.max(40, Math.min(H - 40, p.y))
    })
  }

  return positions
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FriendWeb() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'going' | 'friends'>('all')
  const posRef     = useRef<NodePos[]>([])
  const graphRef   = useRef(buildSocialGraph())


  const graph = graphRef.current

  const getNodeAt = useCallback((x: number, y: number): GraphNode | null => {
    const hit = posRef.current.find(p => {
      const dx = p.x - x, dy = p.y - y
      return Math.sqrt(dx * dx + dy * dy) < 22
    })
    if (!hit) return null
    return graph.nodes.find(n => n.id === hit.id) ?? null
  }, [graph.nodes])

  const draw = useCallback((canvas: HTMLCanvasElement, pos: NodePos[], highlightId?: string | null) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const filteredNodes = filter === 'all' ? graph.nodes
      : filter === 'friends'
        ? graph.nodes.filter(n => n.is_self || graph.edges.some(
            e => (e.source === n.id || e.target === n.id) && e.type === 'friend'
              && (e.source === 'user-alexei' || e.target === 'user-alexei')
          ))
        : graph.nodes.filter(n => n.going_events.length > 0)

    const filteredIds = new Set(filteredNodes.map(n => n.id))

    // ── Draw edges ───────────────────────────────────────────────────────────
    graph.edges.forEach(e => {
      if (!filteredIds.has(e.source) || !filteredIds.has(e.target)) return
      const src = pos.find(p => p.id === e.source)
      const tgt = pos.find(p => p.id === e.target)
      if (!src || !tgt) return

      const isHighlighted = highlightId && (e.source === highlightId || e.target === highlightId)
      const hasShared = e.shared_events.length > 0

      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(tgt.x, tgt.y)

      if (hasShared) {
        ctx.strokeStyle = SHARED_EDGE
        ctx.lineWidth   = isHighlighted ? 3 : 2
        ctx.setLineDash([])
      } else if (e.type === 'friend') {
        ctx.strokeStyle = isHighlighted ? 'rgba(140,100,255,0.8)' : FRIEND_EDGE
        ctx.lineWidth   = isHighlighted ? 2.5 : 1.5
        ctx.setLineDash([])
      } else {
        ctx.strokeStyle = FOLLOW_EDGE
        ctx.lineWidth   = 1
        ctx.setLineDash([4, 4])
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Shared event pulse dot on edge midpoint
      if (hasShared) {
        const mx = (src.x + tgt.x) / 2, my = (src.y + tgt.y) / 2
        ctx.beginPath()
        ctx.arc(mx, my, 4, 0, Math.PI * 2)
        ctx.fillStyle = SHARED_EDGE
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(e.shared_events.length), mx, my)
      }
    })

    // ── Draw nodes ───────────────────────────────────────────────────────────
    filteredNodes.forEach(node => {
      const p = pos.find(pp => pp.id === node.id)
      if (!p) return

      const isHighlighted = highlightId === node.id
      const isSelected    = selected?.id === node.id
      const r = node.is_self ? 26 : isHighlighted ? 22 : 18

      // Glow ring for nodes with shared events
      const sharedCount = graph.edges.filter(
        e => (e.source === node.id || e.target === node.id) && e.shared_events.length > 0
      ).length
      if (sharedCount > 0 || isHighlighted || isSelected) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2)
        ctx.fillStyle = isSelected
          ? 'rgba(255,160,0,0.25)'
          : sharedCount > 0
            ? 'rgba(255,160,0,0.15)'
            : 'rgba(140,100,255,0.2)'
        ctx.fill()
      }

      // Determine colour
      let colour: string
      if (node.is_self) {
        colour = SELF_COLOUR
      } else if (graph.edges.some(e => e.type === 'friend' && ((e.source === 'user-alexei' && e.target === node.id) || (e.target === 'user-alexei' && e.source === node.id)))) {
        colour = FRIEND_COLOUR
      } else if (graph.edges.some(e => (e.source === 'user-alexei' || e.target === 'user-alexei') && (e.source === node.id || e.target === node.id))) {
        colour = FOLLOW_COLOUR
      } else {
        colour = FOF_COLOUR
      }

      // Fill circle
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = colour
      ctx.fill()

      // Border
      ctx.lineWidth = isSelected ? 3 : 1.5
      ctx.strokeStyle = isSelected ? '#ffb300' : 'rgba(255,255,255,0.2)'
      ctx.stroke()

      // Initials
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${node.is_self ? 12 : 10}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.initials, p.x, p.y)

      // Name label
      ctx.fillStyle = isHighlighted ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'
      ctx.font = `${node.is_self ? 11 : 9}px sans-serif`
      ctx.fillText(
        node.is_self ? 'You' : (node.display_name.split(' ')[0]),
        p.x, p.y + r + 11
      )

      // Going-count badge
      if (node.going_events.length > 0) {
        ctx.beginPath()
        ctx.arc(p.x + r - 4, p.y - r + 4, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6600'
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(node.going_events.length), p.x + r - 4, p.y - r + 4)
      }
    })
  }, [graph, filter, selected])

  // Init layout + animate
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width  = W * devicePixelRatio
    canvas.height = H * devicePixelRatio
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio)

    posRef.current = layoutNodes(graph.nodes, graph.edges, W, H)
    draw(canvas, posRef.current, hoveredId)
  }, [graph, draw, hoveredId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    draw(canvas, posRef.current, hoveredId)
  }, [draw, hoveredId, selected, filter])

  // Interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top)
    setHoveredId(node?.id ?? null)
    e.currentTarget.style.cursor = node ? 'pointer' : 'default'
  }, [getNodeAt])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top)
    setSelected(prev => prev?.id === node?.id ? null : node)
  }, [getNodeAt])

  // Touch
  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const t = e.touches[0]
    const node = getNodeAt(t.clientX - rect.left, t.clientY - rect.top)
    setSelected(prev => prev?.id === node?.id ? null : node)
  }, [getNodeAt])

  const selectedEvents = selected
    ? DEMO_EVENTS.filter(ev => selected.going_events.includes(ev.id))
    : []

  const sharedWithSelected = selected && selected.id !== 'user-alexei'
    ? DEMO_EVENTS.filter(ev =>
        DEMO_RSVPS.some(r => r.event_id === ev.id && r.user_id === 'user-alexei' && r.status !== 'not_going') &&
        DEMO_RSVPS.some(r => r.event_id === ev.id && r.user_id === selected.id && r.status !== 'not_going')
      )
    : []

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-sm font-bold text-foreground">Friend Web</p>
            <p className="text-xs text-muted-foreground">
              {graph.nodes.length} people · {graph.edges.filter(e => e.type === 'friend').length} mutual friends
            </p>
          </div>
          <div className="ml-auto flex gap-1.5">
            {(['all','friends','going'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-all capitalize',
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative" style={{ minHeight: 360 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ minHeight: 360 }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onTouchStart={handleTouch}
        />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-xs rounded-xl p-2.5"
          style={{ backgroundColor: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { col: SELF_COLOUR,   label: 'You' },
            { col: FRIEND_COLOUR, label: 'Mutual friend' },
            { col: FOLLOW_COLOUR, label: 'Following' },
            { col: FOF_COLOUR,    label: 'Friend of friend' },
          ].map(({ col, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-1">
            <div className="h-0.5 w-4 shrink-0" style={{ backgroundColor: SHARED_EDGE }} />
            <span className="text-gray-400">Shared event</span>
          </div>
        </div>

        {/* People count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs"
          style={{ backgroundColor: 'rgba(10,10,18,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users size={11} className="text-primary" />
          <span className="text-gray-300">
            {graph.edges.filter(e => e.shared_events.length > 0).length} shared events in your network
          </span>
        </div>
      </div>

      {/* Selected node panel */}
      {selected && (
        <div className="border-t border-border bg-card px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground"
              style={{ backgroundColor: selected.is_self ? SELF_COLOUR : FRIEND_COLOUR }}>
              {selected.initials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{selected.display_name}</p>
              <p className="text-xs text-muted-foreground">{selected.suburb}{selected.scene_tags?.length ? ` · ${selected.scene_tags.slice(0,2).join(', ')}` : ''}</p>
            </div>
            {!selected.is_self && (
              <button className="ml-auto rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                Follow
              </button>
            )}
          </div>

          {sharedWithSelected.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Zap size={11} className="text-amber-500" />
                {sharedWithSelected.length} events you're both going to
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {sharedWithSelected.map(ev => (
                  <div key={ev.id} className="shrink-0 rounded-xl border border-border bg-secondary px-3 py-2 text-xs max-w-[180px]">
                    <p className="font-semibold text-foreground truncate">{ev.title}</p>
                    <p className="text-muted-foreground">{ev.location_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedEvents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {selected.is_self ? 'Your events' : `${selected.display_name.split(' ')[0]}'s events`}
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {selectedEvents.map(ev => (
                  <div key={ev.id} className="shrink-0 rounded-xl border border-border bg-secondary px-3 py-2 text-xs max-w-[180px]">
                    <p className="font-semibold text-foreground truncate">{ev.title}</p>
                    <p className="text-muted-foreground">{ev.location_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
