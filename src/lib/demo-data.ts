import type { Event, Rsvp } from "@/types";

export const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL;

export const DEMO_USER = {
  id: "demo-user-1",
  email: "demo@corral.app",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  role: "authenticated",
} as const;

export const DEMO_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Dusk til Dawn — Open Air Doof",
    description: "Twelve hours of psychedelic trance in the bush. BYO everything. No alcohol sold on site. Bring layers.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "18:00",
    location: "Yarra Valley, VIC",
    image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    created_by: "user-2",
    tags: ["doof", "psytrance", "outdoor"],
    price: 35,
  },
  {
    id: "evt-2",
    title: "BODY — Queer Club Night",
    description: "Melbourne's favourite queer dance night returns. Residents + special guests TBA. 18+.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "22:00",
    location: "The Gasometer, Collingwood",
    image_url: "https://images.unsplash.com/photo-1571609860647-d0e4a02c58c2?w=800&q=80",
    created_by: "user-3",
    tags: ["queer", "club", "music"],
    price: 20,
  },
  {
    id: "evt-3",
    title: "Warehouse Rave — Secret Location",
    description: "Location dropped 3hrs before doors. Industrial techno, no phones on the dancefloor.",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "23:00",
    location: "North Melbourne (TBA)",
    image_url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
    created_by: "user-4",
    tags: ["rave", "techno", "warehouse"],
    price: 25,
  },
  {
    id: "evt-4",
    title: "Sunday Sessions — Free Jazz in the Park",
    description: "Bring a blanket, bring your friends. Local jazz musicians playing in the gardens all afternoon.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "14:00",
    location: "Fitzroy Gardens, Melbourne",
    image_url: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
    created_by: "user-5",
    tags: ["jazz", "outdoor", "free"],
    price: 0,
  },
  {
    id: "evt-5",
    title: "Corral Launch Party 🎪",
    description: "Come test the app and party with the people who built it. DJs, drinks, good vibes only.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "20:00",
    location: "TBA — Melbourne CBD",
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    created_by: "user-1",
    tags: ["launch", "party", "music"],
    price: 0,
  },
];

export const DEMO_RSVPS: Rsvp[] = [
  { id: "r1", event_id: "evt-1", user_id: "user-a", status: "going" },
  { id: "r2", event_id: "evt-1", user_id: "user-b", status: "going" },
  { id: "r3", event_id: "evt-1", user_id: "user-c", status: "interested" },
  { id: "r4", event_id: "evt-1", user_id: "user-d", status: "going" },
  { id: "r5", event_id: "evt-2", user_id: "user-a", status: "going" },
  { id: "r6", event_id: "evt-2", user_id: "user-e", status: "interested" },
  { id: "r7", event_id: "evt-2", user_id: "user-f", status: "going" },
  { id: "r8", event_id: "evt-3", user_id: "user-b", status: "interested" },
  { id: "r9", event_id: "evt-3", user_id: "user-g", status: "going" },
  { id: "r10", event_id: "evt-4", user_id: "user-c", status: "going" },
  { id: "r11", event_id: "evt-4", user_id: "user-d", status: "going" },
  { id: "r12", event_id: "evt-5", user_id: "user-a", status: "going" },
  { id: "r13", event_id: "evt-5", user_id: "user-b", status: "going" },
  { id: "r14", event_id: "evt-5", user_id: "user-c", status: "going" },
  { id: "r15", event_id: "evt-5", user_id: "user-e", status: "interested" },
];

export const DEMO_FRIENDS = [
  { id: "user-a", initials: "JK", name: "Jade K" },
  { id: "user-b", initials: "ML", name: "Max L" },
  { id: "user-c", initials: "SR", name: "Sadiya R" },
  { id: "user-d", initials: "TW", name: "Tom W" },
];
