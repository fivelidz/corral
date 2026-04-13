import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent, useEventRsvps, useUpsertRsvp } from "@/hooks/useEvents";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, ArrowLeft, Check, Star, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const { data: event, isLoading } = useEvent(id!);
  const { data: rsvps = [] } = useEventRsvps(id!);
  const upsertRsvp = useUpsertRsvp();

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!event) return <div className="p-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>Event not found</div>;

  const goingCount = rsvps.filter(r => r.status === "going").length;
  const interestedCount = rsvps.filter(r => r.status === "interested").length;
  const myRsvp = rsvps.find(r => r.user_id === user.id);

  const handleRsvp = (status: "going" | "interested") => {
    upsertRsvp.mutate({ eventId: event.id, userId: user.id, status });
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl">
        {/* Hero image */}
        <div className="relative">
          <img src={event.image_url || "/placeholder.svg"} alt={event.title}
            className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <Link to="/" className="absolute top-4 left-4 rounded-full p-2 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "white" }}>
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="px-4 py-5 space-y-5">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{event.title}</h1>
            {event.tags && event.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {event.tags.map(tag => (
                  <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs"
                    style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              <Clock size={16} />
              <span>{formatDate(event.date)}{event.time ? ` · ${formatTime(event.time)}` : ""}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              <Users size={16} />
              <span>{goingCount} going · {interestedCount} interested</span>
            </div>
            {event.price != null && (
              <div className="text-sm font-semibold" style={{ color: "hsl(var(--primary))" }}>
                {event.price === 0 ? "Free" : `$${event.price}`}
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              {event.description}
            </p>
          )}

          {/* RSVP */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleRsvp("going")} disabled={upsertRsvp.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
              style={myRsvp?.status === "going"
                ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }
              }>
              <Check size={16} />
              Going
            </button>
            <button onClick={() => handleRsvp("interested")} disabled={upsertRsvp.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
              style={myRsvp?.status === "interested"
                ? { backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }
                : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }
              }>
              <Star size={16} />
              Interested
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
