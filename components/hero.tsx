import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center animate-fade-up">
      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs text-muted backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        APSquared · building in public
      </div>
      <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
        Small studio. <br className="hidden sm:block" />
        <span className="gradient-text">Big swings.</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-muted leading-relaxed">
        APSquared designs, builds, and ships products in public — from cocktail AI to startup-idea
        validation. Watch what we&apos;re making and steal the ideas.
      </p>
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="https://idea-launch.io"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Try Idea Launch
          <ArrowRight className="h-4 w-4" />
        </a>
        <Link href="#posts" className="btn-ghost">
          Read the blog
        </Link>
      </div>
    </section>
  )
}
