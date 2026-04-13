import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/create", icon: PlusSquare, label: "Post" },
  { to: "/agent", icon: Bot, label: "Agent" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card) / 0.8)" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--primary))" }}>
            corral
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                {user.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                style={active ? { color: "hsl(var(--primary))" } : { color: "hsl(var(--muted-foreground))" }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
