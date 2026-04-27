import { notFound } from "next/navigation"
import { allPosts } from "contentlayer/generated"

import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import { title } from "process"

interface PostProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slug)

  if (!post) {
    null
  }

  return post
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
    openGraph:{
      images:[post.image ? post.image : ""],
      title:post.title,
      description:post.description,
    },
    twitter:{
      images:[post.image ? post.image : ""],
      title: post.title,
      description: post.description,
    }
  }
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl animate-fade-up">
      <div className="not-prose mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">{post.title}</h1>
        {post.description && (
          <p className="mt-4 text-lg text-muted leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>
      <Mdx code={post.body.code} />
    </article>
  )
}
