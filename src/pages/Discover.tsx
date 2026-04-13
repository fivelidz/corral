import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import SearchAndFilters from "@/components/SearchAndFilters";
import { useEvents, useRsvps } from "@/hooks/useEvents";
import { useMemo } from "react";

export default function Discover() {
  const { user, loading } = useAuth();
  const { data: events = [], isLoading } = useEvents();
  const { data: rsvps = [] } = useRsvps();

  const posts = useMemo(() => events.map(event => {
    const eventRsvps = rsvps.filter(r => r.event_id === event.id);
    return {
      id: event.id,
      image: event.image_url || "/placeholder.svg",
      title: event.title,
      date: event.date,
      time: event.time || "",
      location: event.location || "",
      attending: eventRsvps.filter(r => r.status === "going").length,
      friendsGoing: [] as { id: string; initials: string; name: string }[],
      goingCount: eventRsvps.filter(r => r.status === "going").length,
      interestedCount: eventRsvps.filter(r => r.status === "interested").length,
      tags: event.tags,
      price: event.price,
    };
  }), [events, rsvps]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            Discover
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Explore what's happening around you.
          </p>
        </div>

        <SearchAndFilters />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(p => <EventCard key={p.id} {...p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
