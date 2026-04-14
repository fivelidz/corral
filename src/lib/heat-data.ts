// ── HEAT demo data — Sydney venues + simulated user activity ─────────────────

export interface Venue {
  id: string
  name: string
  type: 'club' | 'bar' | 'pub' | 'warehouse' | 'festival' | 'rooftop' | 'arts'
  address: string
  suburb: string
  lat: number
  lng: number
  capacity: number
  currentUsers: number        // live sim: users present now
  peakTonight: number         // predicted peak
  heatScore: number           // 0–100, composite
  isOpen: boolean
  openTime: string
  closeTime: string
  genre: string[]
  priceRange: '$' | '$$' | '$$$'
  description: string
  website?: string
  // Demographics of current patrons (simulated opt-in data)
  demographics: {
    ageGroups: { label: string; pct: number }[]
    genderSplit: { label: string; pct: number }[]
    topSuburbs: { suburb: string; pct: number }[]
    vibeRatings: { vibe: string; score: number }[]   // energy, crowd, music, value
  }
  // Activity over time (last 12 hours, entries per hour)
  activityHistory: number[]   // index 0 = 12hrs ago, index 11 = now
  // What's on
  tonight?: string
}

// ── Sydney venue seed data ────────────────────────────────────────────────────

export const SYDNEY_VENUES: Venue[] = [
  {
    id: 'v-001',
    name: 'Marquee Sydney',
    type: 'club',
    address: 'Star Entertainment Complex, Pyrmont',
    suburb: 'Pyrmont',
    lat: -33.8698, lng: 151.1947,
    capacity: 2000, currentUsers: 1340, peakTonight: 1800,
    heatScore: 92,
    isOpen: true, openTime: '22:00', closeTime: '06:00',
    genre: ['House', 'Tech House', 'Commercial'],
    priceRange: '$$$',
    description: 'Sydney\'s flagship superclub. International DJs weekly.',
    tonight: 'Fisher — Sold Out',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 38 }, { label: '25–32', pct: 44 },
        { label: '33–40', pct: 14 }, { label: '40+', pct: 4 },
      ],
      genderSplit: [{ label: 'Women', pct: 48 }, { label: 'Men', pct: 46 }, { label: 'Other', pct: 6 }],
      topSuburbs: [
        { suburb: 'Surry Hills', pct: 18 }, { suburb: 'Newtown', pct: 12 },
        { suburb: 'Pyrmont', pct: 10 }, { suburb: 'Bondi', pct: 9 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 94 }, { vibe: 'Crowd', score: 82 },
        { vibe: 'Music', score: 90 }, { vibe: 'Value', score: 45 },
      ],
    },
    activityHistory: [20, 15, 10, 8, 5, 80, 320, 680, 980, 1200, 1340, 1300],
  },
  {
    id: 'v-002',
    name: 'Chinese Laundry',
    type: 'club',
    address: '111 Sussex St, CBD',
    suburb: 'Sydney CBD',
    lat: -33.8689, lng: 151.2023,
    capacity: 800, currentUsers: 640, peakTonight: 750,
    heatScore: 88,
    isOpen: true, openTime: '22:00', closeTime: '06:00',
    genre: ['Techno', 'Industrial', 'Dark Electronic'],
    priceRange: '$$',
    description: 'Underground techno institution. Serious dancefloor culture.',
    tonight: 'Rebūke + local support',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 28 }, { label: '25–32', pct: 50 },
        { label: '33–40', pct: 18 }, { label: '40+', pct: 4 },
      ],
      genderSplit: [{ label: 'Women', pct: 45 }, { label: 'Men', pct: 48 }, { label: 'Other', pct: 7 }],
      topSuburbs: [
        { suburb: 'Newtown', pct: 22 }, { suburb: 'Surry Hills', pct: 16 },
        { suburb: 'Redfern', pct: 11 }, { suburb: 'CBD', pct: 9 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 88 }, { vibe: 'Crowd', score: 91 },
        { vibe: 'Music', score: 95 }, { vibe: 'Value', score: 72 },
      ],
    },
    activityHistory: [10, 8, 5, 4, 3, 60, 180, 420, 560, 620, 640, 610],
  },
  {
    id: 'v-003',
    name: 'Ivy Pool Club',
    type: 'rooftop',
    address: '320 George St, CBD',
    suburb: 'Sydney CBD',
    lat: -33.8673, lng: 151.2070,
    capacity: 1200, currentUsers: 880, peakTonight: 1100,
    heatScore: 85,
    isOpen: true, openTime: '12:00', closeTime: '04:00',
    genre: ['Mainstream', 'Pop', 'Commercial House'],
    priceRange: '$$$',
    description: 'Iconic pool rooftop. Where Sydney comes to be seen.',
    tonight: 'Saturday Pool Party',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 42 }, { label: '25–32', pct: 40 },
        { label: '33–40', pct: 14 }, { label: '40+', pct: 4 },
      ],
      genderSplit: [{ label: 'Women', pct: 54 }, { label: 'Men', pct: 42 }, { label: 'Other', pct: 4 }],
      topSuburbs: [
        { suburb: 'Bondi', pct: 24 }, { suburb: 'Double Bay', pct: 18 },
        { suburb: 'CBD', pct: 14 }, { suburb: 'Paddington', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 80 }, { vibe: 'Crowd', score: 75 },
        { vibe: 'Music', score: 68 }, { vibe: 'Value', score: 38 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 0, 120, 380, 600, 750, 880, 920],
  },
  {
    id: 'v-004',
    name: 'Oxford Art Factory',
    type: 'arts',
    address: '38-46 Oxford St, Darlinghurst',
    suburb: 'Darlinghurst',
    lat: -33.8792, lng: 151.2143,
    capacity: 700, currentUsers: 410, peakTonight: 600,
    heatScore: 74,
    isOpen: true, openTime: '20:00', closeTime: '03:00',
    genre: ['Indie', 'Alternative', 'Art House', 'Jazz'],
    priceRange: '$$',
    description: 'Two rooms, art gallery bar. The creative heart of Darlinghurst.',
    tonight: 'Confidence Man + Hatchie',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 30 }, { label: '25–32', pct: 45 },
        { label: '33–40', pct: 20 }, { label: '40+', pct: 5 },
      ],
      genderSplit: [{ label: 'Women', pct: 52 }, { label: 'Men', pct: 42 }, { label: 'Other', pct: 6 }],
      topSuburbs: [
        { suburb: 'Newtown', pct: 25 }, { suburb: 'Darlinghurst', pct: 18 },
        { suburb: 'Surry Hills', pct: 15 }, { suburb: 'Erskineville', pct: 8 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 72 }, { vibe: 'Crowd', score: 88 },
        { vibe: 'Music', score: 92 }, { vibe: 'Value', score: 78 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 0, 40, 120, 280, 370, 410, 440],
  },
  {
    id: 'v-005',
    name: 'The Beresford',
    type: 'pub',
    address: '354 Bourke St, Surry Hills',
    suburb: 'Surry Hills',
    lat: -33.8823, lng: 151.2108,
    capacity: 500, currentUsers: 310, peakTonight: 420,
    heatScore: 66,
    isOpen: true, openTime: '11:00', closeTime: '02:00',
    genre: ['Pop', 'Mainstream', 'Karaoke'],
    priceRange: '$$',
    description: 'The neighbourhood heartbeat. Three floors, beer garden, Sunday sessions.',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 20 }, { label: '25–32', pct: 38 },
        { label: '33–40', pct: 28 }, { label: '40+', pct: 14 },
      ],
      genderSplit: [{ label: 'Women', pct: 49 }, { label: 'Men', pct: 47 }, { label: 'Other', pct: 4 }],
      topSuburbs: [
        { suburb: 'Surry Hills', pct: 35 }, { suburb: 'Redfern', pct: 14 },
        { suburb: 'Darlinghurst', pct: 12 }, { suburb: 'CBD', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 62 }, { vibe: 'Crowd', score: 78 },
        { vibe: 'Music', score: 65 }, { vibe: 'Value', score: 82 },
      ],
    },
    activityHistory: [30, 20, 12, 8, 6, 40, 90, 180, 240, 290, 310, 330],
  },
  {
    id: 'v-006',
    name: 'Newtown Social Club',
    type: 'bar',
    address: '387 King St, Newtown',
    suburb: 'Newtown',
    lat: -33.8978, lng: 151.1793,
    capacity: 350, currentUsers: 290, peakTonight: 330,
    heatScore: 71,
    isOpen: true, openTime: '17:00', closeTime: '03:00',
    genre: ['Live Music', 'Indie', 'Rock', 'Punk'],
    priceRange: '$',
    description: 'Newtown\'s live music soul. Original bands every night.',
    tonight: 'Local bands showcase — free entry',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 24 }, { label: '25–32', pct: 42 },
        { label: '33–40', pct: 24 }, { label: '40+', pct: 10 },
      ],
      genderSplit: [{ label: 'Women', pct: 47 }, { label: 'Men', pct: 46 }, { label: 'Other', pct: 7 }],
      topSuburbs: [
        { suburb: 'Newtown', pct: 40 }, { suburb: 'Erskineville', pct: 16 },
        { suburb: 'Marrickville', pct: 12 }, { suburb: 'Glebe', pct: 8 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 78 }, { vibe: 'Crowd', score: 90 },
        { vibe: 'Music', score: 96 }, { vibe: 'Value', score: 91 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 20, 60, 150, 220, 270, 290, 310],
  },
  {
    id: 'v-007',
    name: 'Frankie\'s Pizza',
    type: 'bar',
    address: '50 Hunter St, CBD',
    suburb: 'Sydney CBD',
    lat: -33.8661, lng: 151.2095,
    capacity: 280, currentUsers: 240, peakTonight: 280,
    heatScore: 79,
    isOpen: true, openTime: '12:00', closeTime: '04:00',
    genre: ['Rock', 'Metal', 'Punk', 'Karaoke'],
    priceRange: '$',
    description: 'NYC-style dive bar + rock club. $5 pizza slices. No BS.',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 32 }, { label: '25–32', pct: 40 },
        { label: '33–40', pct: 20 }, { label: '40+', pct: 8 },
      ],
      genderSplit: [{ label: 'Women', pct: 44 }, { label: 'Men', pct: 50 }, { label: 'Other', pct: 6 }],
      topSuburbs: [
        { suburb: 'CBD', pct: 28 }, { suburb: 'Surry Hills', pct: 16 },
        { suburb: 'Newtown', pct: 12 }, { suburb: 'Ultimo', pct: 8 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 85 }, { vibe: 'Crowd', score: 88 },
        { vibe: 'Music', score: 86 }, { vibe: 'Value', score: 94 },
      ],
    },
    activityHistory: [40, 30, 20, 14, 10, 50, 100, 180, 220, 240, 240, 250],
  },
  {
    id: 'v-008',
    name: 'Club 77',
    type: 'club',
    address: '77 William St, Darlinghurst',
    suburb: 'Darlinghurst',
    lat: -33.8756, lng: 151.2190,
    capacity: 400, currentUsers: 180, peakTonight: 380,
    heatScore: 58,
    isOpen: true, openTime: '22:00', closeTime: '06:00',
    genre: ['Disco', 'Funk', 'Queer', 'House'],
    priceRange: '$$',
    description: 'Sydney\'s most inclusive basement disco. Queer-friendly, BYO vibes.',
    tonight: 'Disco Brunch late session',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 26 }, { label: '25–32', pct: 46 },
        { label: '33–40', pct: 22 }, { label: '40+', pct: 6 },
      ],
      genderSplit: [{ label: 'Women', pct: 50 }, { label: 'Men', pct: 38 }, { label: 'Other', pct: 12 }],
      topSuburbs: [
        { suburb: 'Darlinghurst', pct: 28 }, { suburb: 'Surry Hills', pct: 20 },
        { suburb: 'Newtown', pct: 14 }, { suburb: 'Redfern', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 70 }, { vibe: 'Crowd', score: 95 },
        { vibe: 'Music', score: 88 }, { vibe: 'Value', score: 74 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 0, 20, 60, 110, 150, 180, 210],
  },
  {
    id: 'v-009',
    name: 'Cargo Bar',
    type: 'bar',
    address: '52 The Promenade, King Street Wharf',
    suburb: 'Darling Harbour',
    lat: -33.8686, lng: 151.2008,
    capacity: 600, currentUsers: 420, peakTonight: 580,
    heatScore: 76,
    isOpen: true, openTime: '12:00', closeTime: '03:00',
    genre: ['Commercial', 'Top 40', 'Pop'],
    priceRange: '$$',
    description: 'Waterfront bar with harbour views. Tourist magnet meets local favourite.',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 35 }, { label: '25–32', pct: 36 },
        { label: '33–40', pct: 20 }, { label: '40+', pct: 9 },
      ],
      genderSplit: [{ label: 'Women', pct: 52 }, { label: 'Men', pct: 44 }, { label: 'Other', pct: 4 }],
      topSuburbs: [
        { suburb: 'Tourist', pct: 30 }, { suburb: 'CBD', pct: 20 },
        { suburb: 'Surry Hills', pct: 10 }, { suburb: 'Pyrmont', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 72 }, { vibe: 'Crowd', score: 70 },
        { vibe: 'Music', score: 60 }, { vibe: 'Value', score: 55 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 60, 160, 320, 400, 420, 420, 440],
  },
  {
    id: 'v-010',
    name: 'Burdekin Hotel',
    type: 'pub',
    address: '2 Oxford St, Darlinghurst',
    suburb: 'Darlinghurst',
    lat: -33.8758, lng: 151.2118,
    capacity: 450, currentUsers: 120, peakTonight: 350,
    heatScore: 40,
    isOpen: true, openTime: '10:00', closeTime: '03:00',
    genre: ['Mainstream', 'Pop', 'Karaoke'],
    priceRange: '$',
    description: 'Heritage pub on Oxford St. Multi-level, late licence.',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 36 }, { label: '25–32', pct: 38 },
        { label: '33–40', pct: 18 }, { label: '40+', pct: 8 },
      ],
      genderSplit: [{ label: 'Women', pct: 50 }, { label: 'Men', pct: 44 }, { label: 'Other', pct: 6 }],
      topSuburbs: [
        { suburb: 'Darlinghurst', pct: 22 }, { suburb: 'CBD', pct: 18 },
        { suburb: 'Paddington', pct: 14 }, { suburb: 'Surry Hills', pct: 12 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 45 }, { vibe: 'Crowd', score: 60 },
        { vibe: 'Music', score: 50 }, { vibe: 'Value', score: 80 },
      ],
    },
    activityHistory: [20, 15, 10, 6, 4, 20, 50, 90, 110, 120, 120, 130],
  },
  {
    id: 'v-011',
    name: 'Goodgod Small Club',
    type: 'club',
    address: '55 Liverpool St, CBD',
    suburb: 'Sydney CBD',
    lat: -33.8726, lng: 151.2049,
    capacity: 300, currentUsers: 220, peakTonight: 290,
    heatScore: 82,
    isOpen: true, openTime: '21:00', closeTime: '05:00',
    genre: ['Rave', 'Jungle', 'Drum & Bass', 'Experimental'],
    priceRange: '$$',
    description: 'Subterranean cult venue. Sydney underground\'s best kept secret.',
    tonight: 'Jungle Fever All-Nighter',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 22 }, { label: '25–32', pct: 52 },
        { label: '33–40', pct: 20 }, { label: '40+', pct: 6 },
      ],
      genderSplit: [{ label: 'Women', pct: 46 }, { label: 'Men', pct: 47 }, { label: 'Other', pct: 7 }],
      topSuburbs: [
        { suburb: 'Newtown', pct: 28 }, { suburb: 'Redfern', pct: 16 },
        { suburb: 'Marrickville', pct: 12 }, { suburb: 'CBD', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 90 }, { vibe: 'Crowd', score: 94 },
        { vibe: 'Music', score: 98 }, { vibe: 'Value', score: 82 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 0, 30, 80, 150, 200, 220, 240],
  },
  {
    id: 'v-012',
    name: 'Lansdowne Hotel',
    type: 'pub',
    address: '2-6 City Rd, Chippendale',
    suburb: 'Chippendale',
    lat: -33.8882, lng: 151.1983,
    capacity: 400, currentUsers: 190, peakTonight: 320,
    heatScore: 55,
    isOpen: true, openTime: '15:00', closeTime: '03:00',
    genre: ['Live Music', 'Punk', 'Metal', 'Indie'],
    priceRange: '$',
    description: 'Gritty live music pub. Student favourite near UTS/USYD.',
    tonight: 'Open mic + late DJ set',
    demographics: {
      ageGroups: [
        { label: '18–24', pct: 44 }, { label: '25–32', pct: 36 },
        { label: '33–40', pct: 14 }, { label: '40+', pct: 6 },
      ],
      genderSplit: [{ label: 'Women', pct: 44 }, { label: 'Men', pct: 50 }, { label: 'Other', pct: 6 }],
      topSuburbs: [
        { suburb: 'Chippendale', pct: 22 }, { suburb: 'Newtown', pct: 18 },
        { suburb: 'Glebe', pct: 14 }, { suburb: 'Redfern', pct: 10 },
      ],
      vibeRatings: [
        { vibe: 'Energy', score: 68 }, { vibe: 'Crowd', score: 80 },
        { vibe: 'Music', score: 84 }, { vibe: 'Value', score: 92 },
      ],
    },
    activityHistory: [0, 0, 0, 0, 0, 30, 80, 140, 170, 190, 190, 200],
  },
]

// ── Progressive demographics ──────────────────────────────────────────────────
// What you share determines what you see.
// disclosureScore 0–5 (each boolean pref adds 1):
//   share_age, share_gender, share_suburb, share_music, share_vibe

import type { VenueInsights, LockedDimension, UserHeatPrefs } from '@/types'

const ALL_LOCKED: LockedDimension[] = [
  {
    dimension: 'age',
    label: 'Age breakdown',
    unlock: 'Share your age range to unlock',
    prefsKey: 'share_age',
  },
  {
    dimension: 'suburb',
    label: 'Where people are coming from',
    unlock: 'Share your home suburb to unlock',
    prefsKey: 'share_suburb',
  },
  {
    dimension: 'music',
    label: 'Music taste breakdown',
    unlock: 'Share your music preferences to unlock',
    prefsKey: 'share_music',
  },
  {
    dimension: 'vibe',
    label: 'Vibe ratings',
    unlock: 'Submit vibe ratings after events to unlock',
    prefsKey: 'share_vibe',
  },
  {
    dimension: 'gender',
    label: 'Gender split',
    unlock: 'Share your gender to unlock',
    prefsKey: 'share_gender',
  },
]

/**
 * Returns what a user can see about a venue, gated by their disclosure score.
 * This is the core mechanic: the more you share, the more you see.
 */
export function getVenueInsights(venue: Venue, prefs: UserHeatPrefs | null): VenueInsights {
  const score = prefs?.disclosure_score ?? 0

  const locked: LockedDimension[] = []
  if (!prefs?.share_age)    locked.push(ALL_LOCKED[0])
  if (!prefs?.share_suburb) locked.push(ALL_LOCKED[1])
  if (!prefs?.share_music)  locked.push(ALL_LOCKED[2])
  if (!prefs?.share_vibe)   locked.push(ALL_LOCKED[3])
  if (!prefs?.share_gender) locked.push(ALL_LOCKED[4])

  const base: VenueInsights = {
    heatScore:        venue.heatScore,
    isOpen:           venue.isOpen,
    currentUsers:     venue.currentUsers,
    capacity:         venue.capacity,
    lockedDimensions: locked,
  }

  // Score >= 1: capacity %
  if (score >= 1) {
    base.capacityPct = Math.round((venue.currentUsers / venue.capacity) * 100)
  }

  // Score >= 2: age breakdown (requires share_age)
  if (prefs?.share_age) {
    base.ageGroups = venue.demographics.ageGroups
  }

  // Score >= 3: suburb origin (requires share_suburb)
  if (prefs?.share_suburb) {
    base.topSuburbs = venue.demographics.topSuburbs
  }

  // Score >= 4: genre breakdown (requires share_music)
  // For now genre comes from the venue tags — real version aggregates from user profiles
  if (prefs?.share_music) {
    base.genreBreakdown = venue.genre.map((g, i) => ({
      genre: g,
      // Simulated distribution — real version: aggregate from attending users' scene_tags
      pct: Math.round(100 / venue.genre.length + (i % 2 === 0 ? 8 : -8)),
    }))
  }

  // Score >= 5: vibe ratings + gender (requires share_vibe + share_gender)
  if (prefs?.share_vibe) {
    base.vibeRatings = venue.demographics.vibeRatings
  }
  if (prefs?.share_gender) {
    base.genderSplit = venue.demographics.genderSplit
  }

  return base
}

/**
 * Demo prefs for testing different disclosure levels.
 */
export const DEMO_PREFS: Record<string, UserHeatPrefs> = {
  nothing: {
    user_id: 'demo', share_age: false, share_gender: false,
    share_suburb: false, share_music: false, share_vibe: false,
    disclosure_score: 0,
  },
  some: {
    user_id: 'demo', share_age: true, share_gender: false,
    share_suburb: true, share_music: false, share_vibe: false,
    disclosure_score: 2,
  },
  full: {
    user_id: 'demo', share_age: true, share_gender: true,
    share_suburb: true, share_music: true, share_vibe: true,
    disclosure_score: 5,
  },
}

// ── Heatmap points — lat/lng/intensity for all venue activity ─────────────────
// Plus scattered individual "user" points around each venue

export function getHeatmapPoints(): [number, number, number][] {
  const points: [number, number, number][] = []

  SYDNEY_VENUES.forEach(v => {
    const intensity = v.heatScore / 100
    // Main venue point — strong
    points.push([v.lat, v.lng, intensity])

    // Scatter surrounding users
    const count = Math.floor(v.currentUsers / 8)
    for (let i = 0; i < count; i++) {
      const dlat = (Math.random() - 0.5) * 0.003
      const dlng = (Math.random() - 0.5) * 0.003
      points.push([v.lat + dlat, v.lng + dlng, intensity * (0.3 + Math.random() * 0.5)])
    }
  })

  return points
}

// ── Simulate live updates every 30s ──────────────────────────────────────────
export function simulateLiveUpdate(venues: Venue[]): Venue[] {
  return venues.map(v => {
    if (!v.isOpen) return v
    const delta = Math.floor((Math.random() - 0.4) * (v.capacity * 0.06))
    const newUsers = Math.max(0, Math.min(v.capacity, v.currentUsers + delta))
    const newScore = Math.round((newUsers / v.capacity) * 100)
    return { ...v, currentUsers: newUsers, heatScore: newScore }
  })
}
