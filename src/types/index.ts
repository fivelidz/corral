// ── Core types — match Supabase schema ────────────────────────────────────────

export interface Profile {
  id:             string
  phone?:         string
  username?:      string
  display_name?:  string
  bio?:           string
  avatar_url?:    string
  city?:          string
  suburb?:        string
  scene_tags?:    string[]
  profile_public?: boolean
  created_at?:    string
}

export type EventCategory =
  | 'festival' | 'club_night' | 'gig' | 'party'
  | 'arts' | 'sport' | 'uni' | 'tour_date'
  | 'market' | 'workshop' | 'other'

export type EventVisibility = 'public' | 'friends' | 'invite'

export interface Event {
  id:             string
  created_by:     string
  title:          string
  description?:   string
  image_url?:     string
  starts_at:      string
  ends_at?:       string
  location_name?: string
  address?:       string
  suburb?:        string
  city?:          string
  lat?:           number
  lng?:           number
  category:       EventCategory
  tags?:          string[]
  price_min?:     number
  price_max?:     number
  ticket_url?:    string
  visibility:     EventVisibility
  series_id?:     string
  created_at?:    string
  is_cancelled?:  boolean
  going_count?:   number
  interested_count?: number
}

export type RsvpStatus = 'going' | 'interested' | 'not_going'

export interface Rsvp {
  id:         string
  event_id:   string
  user_id:    string
  status:     RsvpStatus
  note?:      string
  created_at?: string
}

export type FollowType = 'follow' | 'friend_request' | 'friend'

export interface Follow {
  id:           string
  follower_id:  string
  following_id: string
  follow_type:  FollowType
  created_at?:  string
}

export type NotificationType =
  | 'friend_rsvp' | 'event_update' | 'event_reminder'
  | 'friend_request' | 'friend_accepted' | 'new_follower'
  | 'event_invite' | 'new_event'

export interface Notification {
  id:         string
  user_id:    string
  type:       NotificationType
  actor_id?:  string
  event_id?:  string
  title:      string
  body?:      string
  read:       boolean
  created_at: string
}

export interface FeedPost {
  id:               string
  image:            string
  title:            string
  starts_at:        string
  location_name:    string
  suburb?:          string
  category:         EventCategory
  tags?:            string[]
  price_min?:       number
  going_count:      number
  interested_count: number
  friends_going:    FriendSnippet[]
  my_rsvp?:         RsvpStatus
}

export interface FriendSnippet {
  id:           string
  initials:     string
  display_name: string
  avatar_url?:  string
}

export interface GraphNode {
  id:           string
  display_name: string
  initials:     string
  avatar_url?:  string
  suburb?:      string
  scene_tags?:  string[]
  x?:           number
  y?:           number
  is_self?:     boolean
  going_events: string[]
}

export interface GraphEdge {
  source:        string
  target:        string
  type:          FollowType
  shared_events: string[]
}

export interface SocialGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ── HEAT — Progressive Demographics ──────────────────────────────────────────
// The "earn your insights" model:
// You share a dimension → you can see that dimension on the Heat map.
// disclosure_score 0–5 gates what you see.
//
//   0 — see nothing (just venue names + heat score)
//   1 — see basic crowd count + capacity %
//   2 — see age breakdown (requires share_age)
//   3 — see age + suburb origin (requires share_suburb)
//   4 — see age + suburb + music taste (requires share_music)
//   5 — see full demographics including vibe ratings (requires all)

export interface UserHeatPrefs {
  user_id:          string
  share_age:        boolean   // unlocks: see age breakdown of crowds
  share_gender:     boolean   // unlocks: see gender split of crowds
  share_suburb:     boolean   // unlocks: see where crowds are coming from
  share_music:      boolean   // unlocks: see music taste breakdown at venues
  share_vibe:       boolean   // unlocks: vibe ratings + submit your own
  disclosure_score: number    // 0–5, computed server-side (sum of booleans)
}

// What a given user can see about a venue, based on their disclosure_score
export interface VenueInsights {
  // Always visible
  heatScore:    number
  isOpen:       boolean
  currentUsers: number
  capacity:     number

  // disclosure_score >= 1
  capacityPct?: number

  // disclosure_score >= 2 (share_age)
  ageGroups?:   { label: string; pct: number }[]

  // disclosure_score >= 3 (share_suburb)
  topSuburbs?:  { suburb: string; pct: number }[]

  // disclosure_score >= 4 (share_music)
  genreBreakdown?: { genre: string; pct: number }[]

  // disclosure_score >= 5 (share_vibe)
  vibeRatings?: { vibe: string; score: number }[]
  genderSplit?: { label: string; pct: number }[]

  // What's locked (so UI can show "unlock with your data")
  lockedDimensions: LockedDimension[]
}

export interface LockedDimension {
  dimension: 'age' | 'suburb' | 'music' | 'vibe' | 'gender'
  label:     string        // "Age breakdown"
  unlock:    string        // "Share your age range to unlock"
  prefsKey:  keyof UserHeatPrefs  // which prefs field to toggle
}

// ── SCRAPED EVENTS ────────────────────────────────────────────────────────────
export interface ScrapedEventMeta {
  id:          string
  event_id:    string
  source:      'eventbrite' | 'ra' | 'humanitix' | 'ical' | string
  source_id:   string
  source_url:  string
  fingerprint: string
  scraped_at:  string
}

// Legacy compat
export type User = Profile
export type EventLegacy = Event & { date?: string; time?: string; location?: string; venue?: string }
