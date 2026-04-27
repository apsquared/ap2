import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-black/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="relative inline-block h-7 w-7 rounded-md bg-brand-gradient shadow-glow-sm">
              <span className="absolute inset-[2px] rounded-[5px] bg-[rgb(var(--bg-elevated))] flex items-center justify-center text-[10px] font-bold gradient-text">
                AP
              </span>
            </span>
            <span className="text-lg font-display font-bold tracking-tight gradient-text">
              APSquared
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
            <Link href="/" className="px-3 py-2 rounded-md text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              Home
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              About
            </Link>
            <Link href="/#posts" className="px-3 py-2 rounded-md text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/#posts" className="sm:hidden text-sm text-muted hover:text-[rgb(var(--fg))]">
              Blog
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
