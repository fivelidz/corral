import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/utils";
import type { FeedPost } from "@/types";

type Props = FeedPost;

export default function EventCard({
  id,
  image,
  title,
  date,
  time,
  location,
  goingCount,
  interestedCount,
  friendsGoing,
  intent,
}: Props) {
  const [rsvp, setRsvp] = useState<"going" | "interested" | null>(intent ?? null);

  return (
    <article
      className="rounded-2xl overflow-hidden transition-transform active:scale-[0.99]"
      style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      {/* Image */}
      <Link to={`/event/${id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Date badge */}
          <div className="absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
            style={{ backgroundColor: "hsl(var(--primary) / 0.9)", color: "hsl(var(--primary-foreground))" }}>
            {formatDate(date)}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <Link to={`/event/${id}`}>
          <h2 className="font-semibold text-base leading-snug" style={{ color: "hsl(var(--foreground))" }}>
            {title}
          </h2>
        </Link>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {time && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTime(time)}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={12} />
            {goingCount} going · {interestedCount} interested
          </span>
        </div>

        {/* Friends going avatars */}
        {friendsGoing.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            <div className="flex -space-x-1.5">
              {friendsGoing.slice(0, 4).map(f => (
                <div key={f.id}
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ring-2"
                  style={{
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  outline: "2px solid hsl(var(--card))"
                  }}>
                  {f.initials}
                </div>
              ))}
            </div>
            <span>{friendsGoing.slice(0, 2).map(f => f.name.split(" ")[0]).join(", ")} going</span>
          </div>
        )}

        {/* RSVP buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setRsvp(rsvp === "going" ? null : "going")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all"
            )}
            style={rsvp === "going"
              ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
              : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }
            }
          >
            <Check size={13} strokeWidth={2.5} />
            Going
          </button>
          <button
            onClick={() => setRsvp(rsvp === "interested" ? null : "interested")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all"
            style={rsvp === "interested"
              ? { backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }
              : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }
            }
          >
            <Star size={13} strokeWidth={2.5} />
            Interested
          </button>
        </div>
      </div>
    </article>
  );
}
