import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchAndFilters from "@/components/SearchAndFilters";
import EventCard from "@/components/EventCard";
import DemoBanner from "@/components/DemoBanner";
import { useEvents, useRsvps } from "@/hooks/useEvents";
import { DEMO_FRIENDS } from "@/lib/demo-data";
import { useMemo, useState } from "react";

const Index = () => {
  const { user, loading, isDemo } = useAuth();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: rsvps = [] } = useRsvps();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const feedPosts = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "Tonight") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(e => e.date === today);
    } else if (activeFilter === "This Week") {
      const weekOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.date) <= weekOut);
    } else if (activeFilter === "Free") {
      filtered = filtered.filter(e => !e.price || e.price === 0);
    } else if (activeFilter !== "All") {
      filtered = filtered.filter(e => e.tags?.includes(activeFilter.toLowerCase()));
    }

    return filtered.map((event) => {
      const eventRsvps = rsvps.filter(r => r.event_id === event.id);
      const goingCount = eventRsvps.filter(r => r.status === "going").length;
      const interestedCount = eventRsvps.filter(r => r.status === "interested").length;

      // In demo mode, show some fake friends going
      const friendsGoing = isDemo
        ? DEMO_FRIENDS.filter(f => eventRsvps.some(r => r.user_id === f.id)).slice(0, 3)
        : [];

      return {
        id: event.id,
        image: event.image_url || "/placeholder.svg",
        title: event.title,
        date: event.date,
        time: event.time || "",
        location: event.location || "",
        attending: goingCount,
        friendsGoing,
        goingCount,
        interestedCount,
        tags: event.tags,
        price: event.price,
      };
    });
  }, [events, rsvps, searchQuery, activeFilter, isDemo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      {isDemo && <DemoBanner />}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            Your friends are going out
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            See what your people are up to this week.
          </p>
        </div>

        <SearchAndFilters onSearch={setSearchQuery} onFilter={setActiveFilter} />

        {eventsLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }} />
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-lg font-medium" style={{ color: "hsl(var(--foreground))" }}>Nothing here yet</p>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {searchQuery ? "Try a different search" : "Events posted by people you follow will show up here"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {feedPosts.map(post => <EventCard key={post.id} {...post} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
