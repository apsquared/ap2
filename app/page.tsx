import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Beer, Map, Leaf, Rocket, Home as HomeIcon } from "lucide-react"
import { Hero } from "@/components/hero"
import { ProductCard } from "@/components/product-card"
import { PostCard } from "@/components/post-card"

const products = [
  {
    name: "BarGPT",
    description: "AI cocktail generator. 3,000+ users have shaken up 17,000+ unique cocktails.",
    href: "https://www.bargpt.app",
    accent: "from-amber-400 to-pink-500",
    icon: <Beer className="h-5 w-5" />,
  },
  {
    name: "TVFoodMaps",
    description: "Find restaurants featured on your favorite food TV shows, mapped near you.",
    href: "https://www.tvfoodmaps.com",
    accent: "from-rose-400 to-orange-500",
    icon: <Map className="h-5 w-5" />,
  },
  {
    name: "Legally Vibing",
    description: "Search legal cannabis and THC products — built fast with a vibe-coding workflow.",
    href: "https://www.legallyvibing.com",
    accent: "from-emerald-400 to-teal-500",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    name: "FindMyBnB",
    description: "Find your perfect short-term rental — search and discover vacation stays that fit.",
    href: "https://www.findmybnb.co",
    accent: "from-sky-400 to-indigo-500",
    icon: <HomeIcon className="h-5 w-5" />,
  },
]

export default function Home() {
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const recentPosts = sortedPosts.slice(0, 9)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <Hero />

      <section className="mt-4 sm:mt-8">
        <SectionHeader
          eyebrow="Latest launch"
          title="Idea Launch"
          subtitle="The newest thing we shipped — get in front of real strangers before you build the MVP."
        />
        <FeaturedProduct />
      </section>

      <section className="mt-24">
        <SectionHeader
          eyebrow="Products"
          title="Also shipped & live"
          subtitle="A few other things APSquared has put into the world."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </section>

      <section id="posts" className="mt-24 scroll-mt-20">
        <SectionHeader
          eyebrow="Writing"
          title="From the blog"
          subtitle="Tutorials, postmortems, and notes from #buildinpublic."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentPosts.map((post) => (
            <PostCard
              key={post._id}
              slug={post.slug}
              title={post.title}
              description={post.description}
              date={post.date}
              image={post.image}
            />
          ))}
        </div>
        {sortedPosts.length > recentPosts.length && (
          <div className="mt-10 text-center">
            <span className="text-sm text-muted">
              Showing {recentPosts.length} of {sortedPosts.length} posts
            </span>
          </div>
        )}
      </section>
    </div>
  )
}

function FeaturedProduct() {
  return (
    <a
      href="https://idea-launch.io"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block glass gradient-border rounded-3xl overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/30 via-indigo-500/30 to-fuchsia-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/20 to-sky-500/20 blur-3xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-8 sm:p-10 items-center">
        <div className="md:col-span-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 dark:bg-white/5 px-3 py-1 text-xs text-muted backdrop-blur">
            <Rocket className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            New from APSquared
          </div>
          <h3 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            Validate your startup idea <span className="gradient-text">in days</span>, not months.
          </h3>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-xl">
            Idea Launch runs real Meta ads against your idea for a flat $49 — no ads-manager
            headache, no business setup. Find out if anyone actually clicks before you build.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <span className="btn-primary group-hover:translate-y-0">
              Launch your idea
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <span className="text-sm text-muted">idea-launch.io</span>
          </div>
        </div>
        <div className="md:col-span-2 flex justify-center md:justify-end">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 via-indigo-500/30 to-fuchsia-500/30 blur-2xl rounded-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://idea-launch.io/logo.png"
              alt="Idea Launch"
              className="relative h-40 w-40 sm:h-48 sm:w-48 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </a>
  )
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 font-medium">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-muted max-w-2xl">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-[rgb(var(--fg))] transition-colors whitespace-nowrap"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
