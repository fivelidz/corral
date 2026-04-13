export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  image_url?: string;
  created_by: string;
  created_at?: string;
  tags?: string[];
  price?: number | null;
  venue?: string;
  lat?: number;
  lng?: number;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: "going" | "interested" | "not_going";
  created_at?: string;
}

export interface FriendRelation {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted";
  created_at?: string;
}

export interface FeedPost {
  id: string;
  image: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attending: number;
  friendsGoing: { id: string; initials: string; name: string }[];
  goingCount: number;
  interestedCount: number;
  intent?: "going" | "interested";
  tags?: string[];
  price?: number | null;
}
