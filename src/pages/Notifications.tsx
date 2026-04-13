import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function Notifications() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "hsl(var(--foreground))" }}>Notifications</h1>
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No notifications yet.</p>
        </div>
      </main>
    </div>
  );
}
