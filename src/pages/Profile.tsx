import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { LogOut, Settings } from "lucide-react";

export default function Profile() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const initials = user.email?.[0].toUpperCase() ?? "?";

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Profile</h1>
          <button className="rounded-full p-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Settings size={20} />
          </button>
        </div>

        {/* Avatar + info */}
        <div className="flex flex-col items-center gap-3 py-8 rounded-2xl mb-6"
          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            {initials}
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              {user.email}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              Member since {new Date(user.created_at ?? Date.now()).toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Events going", value: "—" },
            { label: "Interested", value: "—" },
            { label: "Friends", value: "—" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl py-4 text-center"
              style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <p className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={signOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
          style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
          <LogOut size={16} />
          Sign out
        </button>
      </main>
    </div>
  );
}
