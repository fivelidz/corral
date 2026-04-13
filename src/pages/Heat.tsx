import { useEffect, useRef, useState, useCallback } from 'react'
import { Flame, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SYDNEY_VENUES, getHeatmapPoints, simulateLiveUpdate } from '@/lib/heat-data'
import type { Venue } from '@/lib/heat-data'
import VenuePanel from '@/components/heat/VenuePanel'
import VenueMode from '@/components/heat/VenueMode'

// Leaflet CSS — injected at runtime to avoid SSR issues
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

const HEAT_FILTERS = ['All', 'Pumping', 'Clubs', 'Bars', 'Pubs', 'Live Music', 'Rooftop']

export default function Heat() {
  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInstance  = useRef<L.Map | null>(null)
  const heatLayer    = useRef<any>(null)
  const markersRef   = useRef<L.CircleMarker[]>([])

  const [venues, setVenues]         = useState(SYDNEY_VENUES)
  const [selected, setSelected]     = useState<Venue | null>(null)
  const [venueMode, setVenueMode]   = useState<Venue | null>(null)
  const [filter, setFilter]         = useState('All')
  const [_liveCount, setLiveCount]  = useState(0)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [mapLoaded, setMapLoaded]   = useState(false)

  // Total people out right now
  const totalOut = venues.reduce((s, v) => s + (v.isOpen ? v.currentUsers : 0), 0)

  // Filter venues
  const filtered = venues.filter(v => {
    if (filter === 'Pumping')    return v.heatScore >= 75
    if (filter === 'Clubs')      return v.type === 'club'
    if (filter === 'Bars')       return v.type === 'bar'
    if (filter === 'Pubs')       return v.type === 'pub'
    if (filter === 'Live Music') return v.genre.includes('Live Music')
    if (filter === 'Rooftop')    return v.type === 'rooftop'
    return true
  })

  // Heat score colour
  const heatColour = (score: number) => {
    if (score >= 85) return '#ff2d00'
    if (score >= 70) return '#ff6600'
    if (score >= 55) return '#ffaa00'
    if (score >= 40) return '#ffdd00'
    return '#88cc44'
  }

  // Load Leaflet dynamically
  useEffect(() => {
    // Inject CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }

    let isMounted = true

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet.heat')

      if (!mapRef.current || !isMounted) return

      // Prevent double-init
      if (mapInstance.current) return

      const map = L.map(mapRef.current, {
        center: [-33.875, 151.205],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      })
      mapInstance.current = map

      // Dark map tile — CartoDB dark matter
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map)

      // Heatmap layer
      const pts = getHeatmapPoints()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heatLayer.current = (L as any).heatLayer(pts, {
        radius: 28,
        blur: 22,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#000066',
          0.2: '#0044ff',
          0.4: '#00ffcc',
          0.6: '#ffff00',
          0.8: '#ff6600',
          1.0: '#ff0000',
        },
      }).addTo(map)

      // Venue markers
      addMarkers(map, L, SYDNEY_VENUES)

      if (isMounted) setMapLoaded(true)
    }

    initMap()
    return () => { isMounted = false }
  }, [])

  // Add/update venue markers
  const addMarkers = useCallback((map: L.Map, L: typeof import('leaflet'), vs: Venue[]) => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    vs.forEach(v => {
      const col = heatColour(v.heatScore)
      const r   = 6 + (v.heatScore / 100) * 12

      const marker = L.circleMarker([v.lat, v.lng], {
        radius: r,
        fillColor: col,
        fillOpacity: 0.9,
        color: '#000',
        weight: 1.5,
      }).addTo(map)

      marker.on('click', () => setSelected(v))

      // Tooltip
      marker.bindTooltip(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4">
          <strong>${v.name}</strong><br/>
          🔥 ${v.heatScore}/100 · ${v.currentUsers} here now
        </div>
      `, { direction: 'top', offset: [0, -r] })

      markersRef.current.push(marker)
    })
  }, [])

  // Update markers when venues change
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return
    import('leaflet').then(({ default: L }) => {
      addMarkers(mapInstance.current!, L, filtered)
    })
  }, [venues, filter, mapLoaded, filtered, addMarkers])

  // Update heatmap when venues change
  useEffect(() => {
    if (!heatLayer.current) return
    heatLayer.current.setLatLngs(getHeatmapPoints())
  }, [venues])

  // Live simulation — update every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setVenues(v => simulateLiveUpdate(v))
      setLiveCount(c => c + 1)
      setLastUpdate(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (venueMode) {
    return <VenueMode venue={venueMode} onClose={() => setVenueMode(null)} />
  }

  return (
    <div className="relative flex flex-col" style={{ height: '100svh', backgroundColor: '#050508' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-3 pt-3 pointer-events-none">
        <div className="flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 pointer-events-auto"
            style={{ backgroundColor: 'rgba(5,5,8,0.92)', border: '1px solid rgba(255,80,0,0.3)', backdropFilter: 'blur(12px)' }}>
            <Flame size={18} className="text-orange-500" />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#ff6600' }}>HEAT</span>
            <span className="text-xs text-gray-500">Sydney</span>
          </div>

          {/* Live counter */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 pointer-events-auto"
            style={{ backgroundColor: 'rgba(5,5,8,0.92)', border: '1px solid rgba(255,80,0,0.2)', backdropFilter: 'blur(12px)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#ff4400' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#ff4400' }} />
            </span>
            <span className="text-xs font-semibold text-white">{totalOut.toLocaleString()}</span>
            <span className="text-xs text-gray-500">out now</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          {HEAT_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                filter === f
                  ? 'text-black'
                  : 'text-gray-400 hover:text-white',
              )}
              style={filter === f
                ? { backgroundColor: '#ff6600', boxShadow: '0 0 12px rgba(255,102,0,0.5)' }
                : { backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <div ref={mapRef} className="flex-1 w-full" style={{ zIndex: 1 }} />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: '#050508' }}>
          <Flame size={40} className="text-orange-500 animate-pulse" />
          <p className="text-sm text-gray-400">Loading Sydney heat map…</p>
        </div>
      )}

      {/* ── Bottom venue list strip ───────────────────────────────────────────── */}
      {!selected && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] pb-2">
          <div className="px-3 pb-1">
            <p className="text-xs text-gray-600 mb-1.5">
              {filtered.length} venues · updated {lastUpdate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-none">
            {[...filtered].sort((a, b) => b.heatScore - a.heatScore).map(v => (
              <button key={v.id} onClick={() => setSelected(v)}
                className="shrink-0 flex flex-col gap-1 rounded-xl p-3 text-left transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(10,10,18,0.95)',
                  border: `1px solid ${heatColour(v.heatScore)}44`,
                  backdropFilter: 'blur(12px)',
                  minWidth: 160,
                  boxShadow: `0 0 16px ${heatColour(v.heatScore)}22`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate" style={{ maxWidth: 100 }}>{v.name}</span>
                  <span className="text-xs font-bold shrink-0" style={{ color: heatColour(v.heatScore) }}>
                    {v.heatScore}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Heat bar */}
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${v.heatScore}%`, backgroundColor: heatColour(v.heatScore) }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <span className="flex items-center gap-0.5"><Users size={10} />{v.currentUsers}</span>
                  <span className="capitalize">{v.type}</span>
                </div>
                {v.tonight && (
                  <p className="text-xs truncate" style={{ color: '#ff8844' }}>{v.tonight}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Venue detail panel ────────────────────────────────────────────────── */}
      {selected && (
        <VenuePanel
          venue={selected}
          onClose={() => setSelected(null)}
          onVenueMode={() => { setVenueMode(selected); setSelected(null) }}
        />
      )}
    </div>
  )
}
