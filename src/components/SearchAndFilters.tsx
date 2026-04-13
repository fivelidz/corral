import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Tonight", "This Week", "Free", "Music", "Doof", "Art", "Sport"];

interface Props {
  onSearch?: (q: string) => void;
  onFilter?: (filter: string) => void;
}

export default function SearchAndFilters({ onSearch, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");

  const handleSearch = (v: string) => {
    setQuery(v);
    onSearch?.(v);
  };

  const handleFilter = (f: string) => {
    setActive(f);
    onFilter?.(f);
  };

  return (
    <div className="mb-5 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "hsl(var(--muted-foreground))" }} />
        <input
          type="text"
          placeholder="Search events, artists, venues..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
          style={{
            backgroundColor: "hsl(var(--secondary))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "hsl(var(--muted-foreground))" }}>
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-all",
              active === f
                ? "text-primary-foreground"
                : "hover:text-foreground"
            )}
            style={active === f
              ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
              : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
            }
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
