import Link from "next/link"

interface PostCardProps {
  slug: string
  title: string
  description?: string
  date: string
  image?: string
}

export function PostCard({ slug, title, description, date, image }: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link
      href={slug}
      className="group glass gradient-border rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
    >
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-black/5 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-muted uppercase tracking-wider">{formattedDate}</span>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight leading-snug line-clamp-2 group-hover:gradient-text transition-colors">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3">{description}</p>
        )}
      </div>
    </Link>
  )
}
