import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"

export default function Home() {
  return (
    <>
    <div className="mt-5 mb-3 text-lg">
      Welcome to APSquared where we talk about the fun tools we create while we #buildinpublic.  
    </div>
    <div className="prose dark:prose-invert">
      <h1 className="text-2xl mt-10">APSquared Sites:</h1>
      {allPosts.map((post) => (
        <article key={post._id} className="flex">
          <img src={post.image} className="h-32 w-32 mr-10 rounded-lg"/>
          <div>
          <Link href={post.slug}>
            <h2 className="text-xl">{post.title}</h2>
          </Link>
          {post.description && <p>{post.description}</p>}
          </div>
        </article>
      ))}
    </div>
    </>
  )
}
