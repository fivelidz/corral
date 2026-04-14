import type { Event, Rsvp, Profile, Follow, SocialGraph, GraphNode, GraphEdge } from '@/types'

export const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL

// ── Demo user (self) ──────────────────────────────────────────────────────────
export const DEMO_USER = {
  id: 'user-alexei',
  phone: '+61400000001',
  email: 'demo@corral.app',
  display_name: 'You',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
} as const

// ── Demo friend profiles ───────────────────────────────────────────────────────
export const DEMO_PROFILES: Profile[] = [
  { id: 'user-alexei', display_name: 'You (Alexei)',  username: 'alexei', suburb: 'Newtown',      scene_tags: ['doof','techno','rave'],       phone: '+61400000001' },
  { id: 'user-sadiya', display_name: 'Sadiya',        username: 'sadiya', suburb: 'Surry Hills',  scene_tags: ['jazz','arts','indie'],        phone: '+61452213367' },
  { id: 'user-jade',   display_name: 'Jade K',        username: 'jadek',  suburb: 'Marrickville', scene_tags: ['doof','psytrance','outdoor'], phone: '+61400000003' },
  { id: 'user-max',    display_name: 'Max L',         username: 'maxl',   suburb: 'Newtown',      scene_tags: ['techno','warehouse','rave'],  phone: '+61400000004' },
  { id: 'user-tom',    display_name: 'Tom W',         username: 'tomw',   suburb: 'Glebe',        scene_tags: ['club','queer','house'],       phone: '+61400000005' },
  { id: 'user-mia',    display_name: 'Mia R',         username: 'miar',   suburb: 'Redfern',      scene_tags: ['live_music','indie','arts'],  phone: '+61400000006' },
  { id: 'user-ben',    display_name: 'Ben S',         username: 'bens',   suburb: 'Erskineville', scene_tags: ['doof','outdoor','psytrance'], phone: '+61400000007' },
  { id: 'user-priya',  display_name: 'Priya N',       username: 'priyan', suburb: 'Chippendale',  scene_tags: ['arts','festival','theatre'],  phone: '+61400000008' },
  { id: 'user-leo',    display_name: 'Leo C',         username: 'leoc',   suburb: 'Paddington',   scene_tags: ['club','house','techno'],      phone: '+61400000009' },
  { id: 'user-aisha',  display_name: 'Aisha T',       username: 'aishat', suburb: 'Waterloo',     scene_tags: ['rave','dnb','jungle'],        phone: '+61400000010' },
]

// ── Social graph edges (who follows/friends who) ───────────────────────────────
export const DEMO_FOLLOWS: Follow[] = [
  // Alexei's mutual friends
  { id: 'f1',  follower_id: 'user-alexei', following_id: 'user-sadiya', follow_type: 'friend' },
  { id: 'f2',  follower_id: 'user-sadiya', following_id: 'user-alexei', follow_type: 'friend' },
  { id: 'f3',  follower_id: 'user-alexei', following_id: 'user-jade',   follow_type: 'friend' },
  { id: 'f4',  follower_id: 'user-jade',   following_id: 'user-alexei', follow_type: 'friend' },
  { id: 'f5',  follower_id: 'user-alexei', following_id: 'user-max',    follow_type: 'friend' },
  { id: 'f6',  follower_id: 'user-max',    following_id: 'user-alexei', follow_type: 'friend' },
  { id: 'f7',  follower_id: 'user-alexei', following_id: 'user-tom',    follow_type: 'follow' },
  { id: 'f8',  follower_id: 'user-alexei', following_id: 'user-mia',    follow_type: 'follow' },
  // Friend-of-friend connections
  { id: 'f9',  follower_id: 'user-sadiya', following_id: 'user-mia',    follow_type: 'friend' },
  { id: 'f10', follower_id: 'user-mia',    following_id: 'user-sadiya', follow_type: 'friend' },
  { id: 'f11', follower_id: 'user-jade',   following_id: 'user-ben',    follow_type: 'friend' },
  { id: 'f12', follower_id: 'user-ben',    following_id: 'user-jade',   follow_type: 'friend' },
  { id: 'f13', follower_id: 'user-max',    following_id: 'user-jade',   follow_type: 'friend' },
  { id: 'f14', follower_id: 'user-jade',   following_id: 'user-max',    follow_type: 'friend' },
  { id: 'f15', follower_id: 'user-tom',    following_id: 'user-sadiya', follow_type: 'follow' },
  { id: 'f16', follower_id: 'user-priya',  following_id: 'user-sadiya', follow_type: 'friend' },
  { id: 'f17', follower_id: 'user-sadiya', following_id: 'user-priya',  follow_type: 'friend' },
  { id: 'f18', follower_id: 'user-leo',    following_id: 'user-tom',    follow_type: 'friend' },
  { id: 'f19', follower_id: 'user-tom',    following_id: 'user-leo',    follow_type: 'friend' },
  { id: 'f20', follower_id: 'user-aisha',  following_id: 'user-max',    follow_type: 'follow' },
  { id: 'f21', follower_id: 'user-ben',    following_id: 'user-alexei', follow_type: 'follow' },
]

// ── Sydney events — real venues, real vibes ───────────────────────────────────
const d = (daysFromNow: number, hour = 21) => {
  const dt = new Date(Date.now() + daysFromNow * 86400000)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

export const DEMO_EVENTS: Event[] = [
  {
    id: 'evt-1',
    created_by: 'user-jade',
    title: 'Subsonic Music Festival 2026',
    description: 'Australia\'s premier boutique camping music festival. Five stages, 60+ artists, three nights under the stars. Psytrance, techno, downtempo, bass.',
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    starts_at: d(5, 16), ends_at: d(8, 6),
    location_name: 'Sutton Forest Estate', suburb: 'Sutton Forest', city: 'Sydney',
    lat: -34.605, lng: 150.226,
    category: 'festival', tags: ['psytrance','techno','camping','outdoor'],
    price_min: 299, price_max: 349, ticket_url: 'https://subsonicmusic.com.au',
    visibility: 'public',
  },
  {
    id: 'evt-2',
    created_by: 'user-max',
    title: 'Goodgod — Jungle Fever All-Nighter',
    description: 'Subterranean jungle, drum & bass and rave classics. No phones on the floor. Strictly from midnight.',
    image_url: 'https://images.unsplash.com/photo-1571609860647-d0e4a02c58c2?w=800&q=80',
    starts_at: d(2, 22), ends_at: d(3, 7),
    location_name: 'Goodgod Small Club', suburb: 'CBD', city: 'Sydney',
    lat: -33.8726, lng: 151.2049,
    category: 'club_night', tags: ['jungle','dnb','rave'],
    price_min: 25, visibility: 'public',
  },
  {
    id: 'evt-3',
    created_by: 'user-sadiya',
    title: 'Oxford Art Factory — Confidence Man',
    description: 'Confidence Man + Hatchie. Two floors. 18+.',
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    starts_at: d(3, 20), ends_at: d(3, 23),
    location_name: 'Oxford Art Factory', suburb: 'Darlinghurst', city: 'Sydney',
    lat: -33.8792, lng: 151.2143,
    category: 'gig', tags: ['indie','live','alternative'],
    price_min: 45, visibility: 'public',
  },
  {
    id: 'evt-4',
    created_by: 'user-tom',
    title: 'BODY — Queer Club Night',
    description: 'Sydney\'s favourite queer dance night. Residents + special guests TBA. 18+.',
    image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80',
    starts_at: d(1, 22), ends_at: d(2, 5),
    location_name: 'Club 77', suburb: 'Darlinghurst', city: 'Sydney',
    lat: -33.8756, lng: 151.2190,
    category: 'club_night', tags: ['queer','disco','house','funk'],
    price_min: 20, visibility: 'public',
  },
  {
    id: 'evt-5',
    created_by: 'user-alexei',
    title: 'Corral Launch Party 🎪',
    description: 'Come test the app and meet the people who are building it. DJs, drinks, good vibes only. Free entry all night.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    starts_at: d(7, 19), ends_at: d(7, 23),
    location_name: 'Newtown Social Club', suburb: 'Newtown', city: 'Sydney',
    lat: -33.8978, lng: 151.1793,
    category: 'party', tags: ['launch','free','all-welcome'],
    price_min: 0, visibility: 'public',
  },
  {
    id: 'evt-6',
    created_by: 'user-mia',
    title: 'Sunday Jazz — Fitzroy Gardens',
    description: 'Free jazz in the park. Bring a blanket, BYO, dogs welcome.',
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    starts_at: d(4, 13), ends_at: d(4, 17),
    location_name: 'Fitzroy Gardens', suburb: 'Darlinghurst', city: 'Sydney',
    lat: -33.8755, lng: 151.2260,
    category: 'gig', tags: ['jazz','free','outdoor','dogs'],
    price_min: 0, visibility: 'public',
  },
  {
    id: 'evt-7',
    created_by: 'user-priya',
    title: 'UTS Orientation Week — Pool Party',
    description: 'Annual UTS O-Week pool party. Students only. Show your student card at the door.',
    image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
    starts_at: d(1, 14), ends_at: d(1, 20),
    location_name: 'UTS Alumni Green', suburb: 'Ultimo', city: 'Sydney',
    lat: -33.8837, lng: 151.2006,
    category: 'uni', tags: ['uni','oweek','students'],
    price_min: 15, visibility: 'public',
  },
  {
    id: 'evt-8',
    created_by: 'user-ben',
    title: 'Forest Doof — Secret Location',
    description: 'Bush doof. Location dropped Friday 6pm. Bring layers, water, good energy. Leave no trace.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    starts_at: d(6, 18), ends_at: d(7, 10),
    location_name: 'Blue Mountains (TBA)', suburb: 'Blue Mountains', city: 'Sydney',
    lat: -33.7153, lng: 150.3118,
    category: 'festival', tags: ['doof','psytrance','outdoor','camping'],
    price_min: 40, visibility: 'friends',
  },
  {
    id: 'evt-9',
    created_by: 'user-sadiya',
    title: 'Jade\'s Birthday House Party',
    description: 'Jade is turning 27. Come through. BYO. Starts 8pm, goes all night.',
    image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
    starts_at: d(3, 20), ends_at: d(4, 3),
    location_name: 'Jade\'s place, Marrickville', suburb: 'Marrickville', city: 'Sydney',
    lat: -33.9074, lng: 151.1553,
    category: 'party', tags: ['birthday','byo','house'],
    price_min: 0, visibility: 'invite',
  },
  {
    id: 'evt-10',
    created_by: 'user-leo',
    title: 'Chinese Laundry — Rebūke',
    description: 'Rebūke + residents. Industrial techno. Doors 10pm. No refunds.',
    image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80',
    starts_at: d(2, 22), ends_at: d(3, 6),
    location_name: 'Chinese Laundry', suburb: 'CBD', city: 'Sydney',
    lat: -33.8689, lng: 151.2023,
    category: 'club_night', tags: ['techno','industrial','dark'],
    price_min: 35, visibility: 'public',
  },
]

// ── RSVPs — who's going to what ───────────────────────────────────────────────
export const DEMO_RSVPS: Rsvp[] = [
  // Subsonic Festival (evt-1) — lots of people
  { id: 'r1',  event_id: 'evt-1', user_id: 'user-jade',   status: 'going' },
  { id: 'r2',  event_id: 'evt-1', user_id: 'user-max',    status: 'going' },
  { id: 'r3',  event_id: 'evt-1', user_id: 'user-ben',    status: 'going' },
  { id: 'r4',  event_id: 'evt-1', user_id: 'user-alexei', status: 'interested' },
  { id: 'r5',  event_id: 'evt-1', user_id: 'user-aisha',  status: 'going' },
  // Goodgod Jungle (evt-2)
  { id: 'r6',  event_id: 'evt-2', user_id: 'user-max',    status: 'going' },
  { id: 'r7',  event_id: 'evt-2', user_id: 'user-aisha',  status: 'going' },
  { id: 'r8',  event_id: 'evt-2', user_id: 'user-alexei', status: 'going' },
  // OAF Confidence Man (evt-3)
  { id: 'r9',  event_id: 'evt-3', user_id: 'user-sadiya', status: 'going' },
  { id: 'r10', event_id: 'evt-3', user_id: 'user-mia',    status: 'going' },
  { id: 'r11', event_id: 'evt-3', user_id: 'user-priya',  status: 'interested' },
  // BODY (evt-4)
  { id: 'r12', event_id: 'evt-4', user_id: 'user-tom',    status: 'going' },
  { id: 'r13', event_id: 'evt-4', user_id: 'user-leo',    status: 'going' },
  { id: 'r14', event_id: 'evt-4', user_id: 'user-sadiya', status: 'interested' },
  // Corral Launch (evt-5)
  { id: 'r15', event_id: 'evt-5', user_id: 'user-alexei', status: 'going' },
  { id: 'r16', event_id: 'evt-5', user_id: 'user-sadiya', status: 'going' },
  { id: 'r17', event_id: 'evt-5', user_id: 'user-jade',   status: 'going' },
  { id: 'r18', event_id: 'evt-5', user_id: 'user-max',    status: 'going' },
  { id: 'r19', event_id: 'evt-5', user_id: 'user-mia',    status: 'interested' },
  { id: 'r20', event_id: 'evt-5', user_id: 'user-priya',  status: 'going' },
  // Sunday Jazz (evt-6)
  { id: 'r21', event_id: 'evt-6', user_id: 'user-sadiya', status: 'going' },
  { id: 'r22', event_id: 'evt-6', user_id: 'user-mia',    status: 'going' },
  { id: 'r23', event_id: 'evt-6', user_id: 'user-priya',  status: 'going' },
  { id: 'r24', event_id: 'evt-6', user_id: 'user-alexei', status: 'interested' },
  // Forest Doof — friends only (evt-8)
  { id: 'r25', event_id: 'evt-8', user_id: 'user-jade',   status: 'going' },
  { id: 'r26', event_id: 'evt-8', user_id: 'user-ben',    status: 'going' },
  { id: 'r27', event_id: 'evt-8', user_id: 'user-max',    status: 'going' },
  // Chinese Laundry (evt-10)
  { id: 'r28', event_id: 'evt-10', user_id: 'user-leo',   status: 'going' },
  { id: 'r29', event_id: 'evt-10', user_id: 'user-max',   status: 'interested' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getProfile(id: string): Profile | undefined {
  return DEMO_PROFILES.find(p => p.id === id)
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function getFriendsGoing(eventId: string, selfId: string) {
  const myFollowing = DEMO_FOLLOWS
    .filter(f => f.follower_id === selfId)
    .map(f => f.following_id)

  return DEMO_RSVPS
    .filter(r => r.event_id === eventId && r.status === 'going' && myFollowing.includes(r.user_id))
    .map(r => {
      const p = getProfile(r.user_id)
      return p ? {
        id: p.id,
        display_name: p.display_name ?? p.username ?? 'Unknown',
        initials: getInitials(p.display_name ?? p.username ?? '?'),
        avatar_url: p.avatar_url,
      } : null
    })
    .filter(Boolean) as { id: string; display_name: string; initials: string; avatar_url?: string }[]
}

// ── Social graph data for friend web visualisation ────────────────────────────
export function buildSocialGraph(selfId = 'user-alexei'): SocialGraph {
  // Nodes: self + people connected to self (up to 2 hops)
  const myConnections = new Set(
    DEMO_FOLLOWS
      .filter(f => f.follower_id === selfId || f.following_id === selfId)
      .flatMap(f => [f.follower_id, f.following_id])
  )

  // Also include friends-of-friends for a richer graph
  const fofConnections = new Set<string>()
  myConnections.forEach(uid => {
    DEMO_FOLLOWS
      .filter(f => f.follower_id === uid || f.following_id === uid)
      .forEach(f => { fofConnections.add(f.follower_id); fofConnections.add(f.following_id) })
  })

  const allIds = new Set([...myConnections, ...fofConnections])

  // Build nodes
  const nodes: GraphNode[] = Array.from(allIds).map(uid => {
    const p = getProfile(uid)
    const goingEvents = DEMO_RSVPS
      .filter(r => r.user_id === uid && r.status === 'going')
      .map(r => r.event_id)
    return {
      id:           uid,
      display_name: p?.display_name ?? p?.username ?? uid,
      initials:     getInitials(p?.display_name ?? p?.username ?? '?'),
      avatar_url:   p?.avatar_url,
      suburb:       p?.suburb,
      scene_tags:   p?.scene_tags,
      is_self:      uid === selfId,
      going_events: goingEvents,
    }
  })

  // Build edges — deduplicate bidirectional pairs
  const seen = new Set<string>()
  const edges: GraphEdge[] = []
  DEMO_FOLLOWS.forEach(f => {
    const key = [f.follower_id, f.following_id].sort().join('--')
    if (!seen.has(key) && allIds.has(f.follower_id) && allIds.has(f.following_id)) {
      seen.add(key)
      const sourceEvents = DEMO_RSVPS.filter(r => r.user_id === f.follower_id && r.status === 'going').map(r => r.event_id)
      const targetEvents = DEMO_RSVPS.filter(r => r.user_id === f.following_id && r.status === 'going').map(r => r.event_id)
      const sharedEvents = sourceEvents.filter(e => targetEvents.includes(e))
      edges.push({
        source:        f.follower_id,
        target:        f.following_id,
        type:          f.follow_type,
        shared_events: sharedEvents,
      })
    }
  })

  return { nodes, edges }
}

// Legacy compat for hooks that still use old field names
export const DEMO_FRIENDS = DEMO_PROFILES.slice(1, 5).map(p => ({
  id: p.id,
  initials: getInitials(p.display_name ?? '?'),
  name: p.display_name ?? '',
}))
