import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"

export default function Home() {
  return (
    <>
    <div className="mt-5 mb-3">
      Welcome to APSquared where we talk about the fun tools we create while we #buildinpublic.  
    </div>
    <div className="prose dark:prose-invert">
      <h1 className="text-2xl mt-10">APSquared Sites:</h1>
      {allPosts.map((post) => (
        <article key={post._id}>
          <Link href={post.slug}>
            <h2 className="text-xl">{post.title}</h2>
          </Link>
          {post.description && <p>{post.description}</p>}
        </article>
      ))}
    </div>
    </>
  )
}
