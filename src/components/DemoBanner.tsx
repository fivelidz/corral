import { Zap } from 'lucide-react'

export default function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
      <Zap size={12} />
      Demo mode — events and friends are simulated.
    </div>
  )
}
