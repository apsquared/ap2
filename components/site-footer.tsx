import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-24 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Follow APSquared</span>
            <div className="flex items-center gap-2">
              <a
                rel="nofollow"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                href="https://twitter.com/APSquaredDev"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.093 4.093 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.615 11.615 0 0 0 6.29 1.84" />
                </svg>
              </a>
              <a
                rel="nofollow"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                href="https://github.com/apsquared"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                rel="nofollow"
                aria-label="Bluesky"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-muted hover:text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                href="https://bsky.app/profile/apsquared.bsky.social"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 2L8 7.5L12 13L16 7.5L12 2Z M8 7.5L4 13L8 18.5L12 13L8 7.5Z M12 13L16 18.5L20 13L16 7.5L12 13Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <a className="hover:text-[rgb(var(--fg))] transition-colors" href="https://idea-launch.io">Idea Launch</a>
            <a className="hover:text-[rgb(var(--fg))] transition-colors" href="https://www.tvfoodmaps.com">TVFoodMaps</a>
            <a className="hover:text-[rgb(var(--fg))] transition-colors" href="https://www.bargpt.app">BarGPT</a>
            <a className="hover:text-[rgb(var(--fg))] transition-colors" href="https://www.legallyvibing.com">Legally Vibing</a>
            <Link className="hover:text-[rgb(var(--fg))] transition-colors" href="/privacy">Privacy</Link>
            <Link className="hover:text-[rgb(var(--fg))] transition-colors" href="/terms">Terms</Link>
          </div>
        </div>
        <div className="mt-6 text-xs text-muted text-center sm:text-left">
          © {new Date().getFullYear()} APSquared. Built in public.
        </div>
      </div>
    </footer>
  )
}
