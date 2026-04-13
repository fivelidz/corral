import { ArrowLeft, Users, TrendingUp, BarChart2, MapPin, Clock, Flame, Award } from 'lucide-react'
import type { Venue } from '@/lib/heat-data'

interface Props {
  venue: Venue
  onClose: () => void
}

const heatColour = (s: number) => {
  if (s >= 85) return '#ff2d00'
  if (s >= 70) return '#ff6600'
  if (s >= 55) return '#ffaa00'
  if (s >= 40) return '#ffdd00'
  return '#88cc44'
}

function Bar({ value, max = 100, colour, label, sub }: { value: number; max?: number; colour: string; label: string; sub?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <div className="text-right">
          <span className="text-white font-semibold">{value}{max === 100 ? '%' : ''}</span>
          {sub && <span className="text-gray-600 ml-1">{sub}</span>}
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: colour }} />
      </div>
    </div>
  )
}

function DonutChart({ segments, size = 120 }: {
  segments: { label: string; pct: number; colour: string }[]
  size?: number
}) {
  let cumulative = 0
  const cx = size / 2, cy = size / 2
  const r = size * 0.38, innerR = size * 0.24
  const paths: { d: string; colour: string; label: string; pct: number }[] = []

  segments.forEach(s => {
    const start = (cumulative / 100) * 360 - 90
    const end   = ((cumulative + s.pct) / 100) * 360 - 90
    const startRad = (start * Math.PI) / 180
    const endRad   = (end   * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad),   y2 = cy + r * Math.sin(endRad)
    const xi1 = cx + innerR * Math.cos(endRad), yi1 = cy + innerR * Math.sin(endRad)
    const xi2 = cx + innerR * Math.cos(startRad), yi2 = cy + innerR * Math.sin(startRad)
    const large = s.pct > 50 ? 1 : 0
    paths.push({
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`,
      colour: s.colour,
      label: s.label,
      pct: s.pct,
    })
    cumulative += s.pct
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.colour} stroke="rgba(8,8,14,0.8)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function ActivityGraph({ history, capacity }: { history: number[]; capacity: number }) {
  const max = Math.max(...history, 1)
  const W = 280, H = 80
  const labels = ['12h ago', '9h ago', '6h ago', '3h ago', 'now']

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Capacity line */}
        <line x1="0" y1={H - (capacity / (capacity * 1.2)) * H * 0.9} x2={W} y2={H - (capacity / (capacity * 1.2)) * H * 0.9}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
        {/* Area */}
        {(() => {
          const pts = history.map((v, i) => {
            const x = (i / (history.length - 1)) * W
            const y = H - (v / max) * H * 0.85
            return `${x},${y}`
          })
          return (
            <>
              <polygon points={`0,${H} ${pts.join(' ')} ${W},${H}`} fill="url(#areaGrad)" />
              <polyline points={pts.join(' ')} fill="none" stroke="#ff6600" strokeWidth="2" strokeLinejoin="round" />
            </>
          )
        })()}
        {/* Current point */}
        {(() => {
          const last = history[history.length - 1]
          const y = H - (last / max) * H * 0.85
          return (
            <>
              <circle cx={W} cy={y} r="4" fill="#ff6600" />
              <circle cx={W} cy={y} r="8" fill="rgba(255,102,0,0.2)" />
            </>
          )
        })()}
      </svg>
      <div className="flex justify-between text-gray-600" style={{ fontSize: 10 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  )
}

export default function VenueMode({ venue: v, onClose }: Props) {
  const col = heatColour(v.heatScore)
  const cap_pct = Math.round((v.currentUsers / v.capacity) * 100)
  const d = v.demographics

  const GENDER_COLOURS = ['#ff6090', '#4488ff', '#aa88ff']
  const AGE_COLOURS    = ['#ff6600', '#ffaa00', '#44aaff', '#88cc44']

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#050508', color: 'white' }}>

      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(5,5,8,0.98)', borderBottom: `1px solid ${col}33`, backdropFilter: 'blur(16px)' }}>
        <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Venue Mode</p>
          <h1 className="text-base font-bold text-white leading-tight truncate">{v.name}</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
          style={{ backgroundColor: col + '22', border: `1px solid ${col}44` }}>
          <Flame size={14} style={{ color: col }} />
          <span className="text-sm font-black" style={{ color: col }}>{v.heatScore}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users,     label: 'Here Now',    value: v.currentUsers.toLocaleString(), sub: `/ ${v.capacity} cap` },
            { icon: TrendingUp,label: 'Peak Tonight', value: v.peakTonight.toLocaleString(), sub: 'predicted' },
            { icon: BarChart2, label: 'Capacity',     value: `${cap_pct}%`,                  sub: cap_pct >= 80 ? '🔥 Near full' : cap_pct >= 50 ? '✅ Good crowd' : '🕐 Building' },
            { icon: Clock,     label: 'Open Until',   value: v.closeTime,                    sub: v.openTime + ' open' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <s.icon size={16} className="text-gray-600 mb-2" />
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: col }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Activity over time */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: col }} />
            <p className="text-sm font-semibold text-white">Activity tonight</p>
          </div>
          <ActivityGraph history={v.activityHistory} capacity={v.capacity} />
        </div>

        {/* Gender split */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold text-white mb-3">Gender split</p>
          <div className="flex items-center gap-4">
            <DonutChart
              segments={d.genderSplit.map((g, i) => ({ label: g.label, pct: g.pct, colour: GENDER_COLOURS[i] || '#888' }))}
            />
            <div className="flex-1 space-y-2">
              {d.genderSplit.map((g, i) => (
                <Bar key={g.label} label={g.label} value={g.pct} colour={GENDER_COLOURS[i] || '#888'} />
              ))}
            </div>
          </div>
        </div>

        {/* Age groups */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold text-white mb-3">Age groups</p>
          <div className="flex items-center gap-4">
            <DonutChart
              size={100}
              segments={d.ageGroups.map((a, i) => ({ label: a.label, pct: a.pct, colour: AGE_COLOURS[i] || '#888' }))}
            />
            <div className="flex-1 space-y-2">
              {d.ageGroups.map((a, i) => (
                <Bar key={a.label} label={a.label} value={a.pct} colour={AGE_COLOURS[i] || '#888'} />
              ))}
            </div>
          </div>
        </div>

        {/* Where people are coming from */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} style={{ color: col }} />
            <p className="text-sm font-semibold text-white">Where they're coming from</p>
          </div>
          <div className="space-y-2.5">
            {d.topSuburbs.map((s, i) => (
              <div key={s.suburb}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-mono">#{i + 1}</span>
                    <span className="text-gray-300">{s.suburb}</span>
                  </div>
                  <span className="text-white font-semibold">{s.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct * 2}%`, backgroundColor: col, opacity: 1 - i * 0.15 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe scores */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} style={{ color: col }} />
            <p className="text-sm font-semibold text-white">Vibe ratings</p>
            <span className="text-xs text-gray-600 ml-auto">from patrons tonight</span>
          </div>
          <div className="space-y-3">
            {d.vibeRatings.map(r => (
              <Bar key={r.vibe}
                label={r.vibe}
                value={r.score}
                colour={r.score >= 80 ? '#ff6600' : r.score >= 60 ? '#ffaa00' : '#44aaff'}
                sub={r.score >= 85 ? '🔥' : r.score >= 70 ? '✅' : ''}
              />
            ))}
          </div>
        </div>

        {/* Genre + scene */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-semibold text-white mb-2">Music / Scene</p>
          <div className="flex flex-wrap gap-1.5">
            {v.genre.map(g => (
              <span key={g} className="rounded-full px-3 py-1 text-xs text-gray-300"
                style={{ backgroundColor: col + '22', border: `1px solid ${col}44` }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Data consent note */}
        <div className="rounded-xl p-4 text-xs text-gray-600 space-y-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="font-semibold text-gray-500">About this data</p>
          <p>Demographics are aggregated from opted-in Corral users who have shared their location and profile data. Individual users are never identified. Data refreshes every 30 seconds.</p>
          <p>Venue owners can access full analytics including hourly breakdowns, comparison data, and export reports.</p>
        </div>

      </div>
    </div>
  )
}
