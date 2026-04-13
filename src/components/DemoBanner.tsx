import { Zap } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="px-4 py-2 text-xs font-medium flex items-center justify-center gap-2"
      style={{ backgroundColor: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", borderBottom: "1px solid hsl(var(--primary) / 0.2)" }}>
      <Zap size={12} />
      Demo mode — no backend connected. Events and friends are simulated.
    </div>
  );
}
