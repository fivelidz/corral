import { X, MapPin, TrendingUp, BarChart2, ExternalLink, ChevronRight } from 'lucide-react'
import type { Venue } from '@/lib/heat-data'

interface Props {
  venue: Venue
  onClose: () => void
  onVenueMode: () => void
}

const heatColour = (s: number) => {
  if (s >= 85) return '#ff2d00'
  if (s >= 70) return '#ff6600'
  if (s >= 55) return '#ffaa00'
  if (s >= 40) return '#ffdd00'
  return '#88cc44'
}

function MiniBar({ value, max = 100, colour }: { value: number; max?: number; colour: string }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: colour }} />
    </div>
  )
}

function ActivitySparkline({ history }: { history: number[] }) {
  const max = Math.max(...history, 1)
  const w = 100 / history.length
  const labels = ['12h', '11h', '10h', '9h', '8h', '7h', '6h', '5h', '4h', '3h', '2h', 'now']

  return (
    <div>
      <svg viewBox={`0 0 100 32`} className="w-full" style={{ height: 40 }}>
        {/* Area fill */}
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polyline
          points={history.map((v, i) => `${i * w + w / 2},${32 - (v / max) * 28}`).join(' ')}
          fill="none"
          stroke="#ff6600"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points={[
            ...history.map((v, i) => `${i * w + w / 2},${32 - (v / max) * 28}`),
            `${99},32`, `${w / 2},32`,
          ].join(' ')}
          fill="url(#sparkGrad)"
        />
      </svg>
      <div className="flex justify-between mt-0.5">
        {[labels[0], labels[5], labels[11]].map(l => (
          <span key={l} className="text-gray-600" style={{ fontSize: 9 }}>{l} ago</span>
        ))}
      </div>
    </div>
  )
}

export default function VenuePanel({ venue: v, onClose, onVenueMode }: Props) {
  const col = heatColour(v.heatScore)
  const capacity_pct = Math.round((v.currentUsers / v.capacity) * 100)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1001] rounded-t-2xl overflow-hidden"
      style={{
        backgroundColor: 'rgba(8,8,14,0.98)',
        border: `1px solid ${col}33`,
        borderBottom: 'none',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 -8px 40px ${col}22`,
        maxHeight: '72vh',
        overflowY: 'auto',
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
      </div>

      <div className="px-4 pb-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Heat score badge */}
              <div className="rounded-lg px-2 py-0.5 text-xs font-black"
                style={{ backgroundColor: col + '22', color: col, border: `1px solid ${col}44` }}>
                🔥 {v.heatScore}
              </div>
              <span className="text-xs text-gray-500 capitalize">{v.type}</span>
              <span className="text-xs text-gray-600">{v.priceRange}</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{v.name}</h2>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
              <MapPin size={11} />
              <span>{v.address}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="rounded-full p-1.5 text-gray-600 hover:text-white transition-colors shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Live stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Here now', value: v.currentUsers.toLocaleString(), sub: `of ${v.capacity}` },
            { label: 'Capacity', value: `${capacity_pct}%`, sub: v.isOpen ? 'open' : 'closed' },
            { label: 'Heat', value: `${v.heatScore}/100`, sub: v.heatScore >= 75 ? 'pumping' : v.heatScore >= 50 ? 'moving' : 'quiet' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xs" style={{ color: col }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* What's on */}
        {v.tonight && (
          <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
            style={{ backgroundColor: col + '11', border: `1px solid ${col}33` }}>
            <span style={{ color: col }}>🎵</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{v.tonight}</p>
              <p className="text-xs text-gray-500">{v.openTime} – {v.closeTime}</p>
            </div>
          </div>
        )}

        {/* Capacity bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Capacity</span>
            <span>{capacity_pct}%</span>
          </div>
          <MiniBar value={capacity_pct} colour={col} />
        </div>

        {/* Activity sparkline */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <TrendingUp size={12} />
            <span>Activity tonight</span>
          </div>
          <ActivitySparkline history={v.activityHistory} />
        </div>

        {/* Vibe ratings */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <BarChart2 size={12} />
            <span>Vibe ratings (live)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {v.demographics.vibeRatings.map(r => (
              <div key={r.vibe}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-400">{r.vibe}</span>
                  <span className="text-white font-medium">{r.score}</span>
                </div>
                <MiniBar value={r.score} colour={r.score >= 80 ? '#ff6600' : r.score >= 60 ? '#ffaa00' : '#44aaff'} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick demographics preview */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Who's here now</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {v.demographics.ageGroups.map(a => (
              <div key={a.label} className="shrink-0 text-center rounded-lg px-3 py-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 60 }}>
                <p className="text-sm font-bold text-white">{a.pct}%</p>
                <p className="text-xs text-gray-600">{a.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-1.5">
          {v.genre.map(g => (
            <span key={g} className="rounded-full px-2.5 py-1 text-xs text-gray-400"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {g}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>

        {/* Venue mode CTA */}
        <button onClick={onVenueMode}
          className="w-full rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ backgroundColor: col + '22', border: `1px solid ${col}55`, color: col }}>
          <BarChart2 size={16} />
          Venue Mode — Full Analytics
          <ChevronRight size={16} />
        </button>

        {v.website && (
          <a href={v.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            <ExternalLink size={12} />
            {v.website}
          </a>
        )}
      </div>
    </div>
  )
}
