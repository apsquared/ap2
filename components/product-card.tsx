import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

interface ProductCardProps {
  name: string
  description: string
  href: string
  accent: string // tailwind gradient classes for icon halo
  icon: ReactNode
}

export function ProductCard({ name, description, href, accent, icon }: ProductCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass gradient-border rounded-2xl p-6 flex flex-col h-full transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-glow-sm`}>
          {icon}
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted group-hover:text-[rgb(var(--fg))] transition-colors" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{name}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
    </a>
  )
}
