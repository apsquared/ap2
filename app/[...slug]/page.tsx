import { notFound } from "next/navigation"
import { Metadata } from "next"
import { allPages } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"

interface PageProps {
  params: {
    slug: string[]
  }
}

async function getPageFromParams(params: PageProps["params"]) {
  const slug = params?.slug?.join("/")
  const page = allPages.find((page) => page.slugAsParams === slug)

  if (!page) {
    null
  }

  return page
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPageFromParams(params)

  if (!page) {
    return {}
  }

  return {
    title: page.title,
    description: page.description,
  }
}

export async function generateStaticParams(): Promise<PageProps["params"][]> {
  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }))
}

export default async function PagePage({ params }: PageProps) {
  const page = await getPageFromParams(params)

  if (!page) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline animate-fade-up">
      <div className="not-prose mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">{page.title}</h1>
        {page.description && <p className="mt-4 text-lg text-muted leading-relaxed">{page.description}</p>}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>
      <Mdx code={page.body.code} />
    </article>
  )
}
