import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "@/hooks/useEvents";
import Navbar from "@/components/Navbar";
import { ImagePlus } from "lucide-react";

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    image_url: "",
    tags: "",
  });
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createEvent.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        date: form.date,
        time: form.time || undefined,
        location: form.location || undefined,
        price: form.price ? parseFloat(form.price) : null,
        image_url: form.image_url || undefined,
        tags: form.tags ? form.tags.split(",").map(t => t.trim().toLowerCase()) : undefined,
        created_by: user.id,
      });
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  const inputStyle = {
    backgroundColor: "hsl(var(--secondary))",
    color: "hsl(var(--foreground))",
    border: "1px solid hsl(var(--border))",
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6" style={{ color: "hsl(var(--foreground))" }}>
          Post an event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image placeholder */}
          <div className="rounded-2xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "2px dashed hsl(var(--border))" }}>
            <ImagePlus size={28} style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Add event photo</span>
          </div>

          <input type="text" placeholder="Event title *" required
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

          <textarea placeholder="Description" rows={3}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />

          <div className="grid grid-cols-2 gap-3">
            <input type="date" required
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <input type="time"
              value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          </div>

          <input type="text" placeholder="Location / Venue"
            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

          <input type="number" placeholder="Ticket price (leave blank if free)"
            value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

          <input type="text" placeholder="Tags (comma separated, e.g. music, doof, rave)"
            value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

          {error && <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>{error}</p>}

          <button type="submit" disabled={createEvent.isPending}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            {createEvent.isPending ? "Posting..." : "Post event"}
          </button>
        </form>
      </main>
    </div>
  );
}
