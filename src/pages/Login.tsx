import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "hsl(var(--primary))" }}>
            corral
          </h1>
          <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Find your people. Find your events.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "hsl(var(--destructive))" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold" style={{ color: "hsl(var(--primary))" }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
