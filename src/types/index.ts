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

// Legacy compat
export type User = Profile
export type EventLegacy = Event & { date?: string; time?: string; location?: string; venue?: string }
