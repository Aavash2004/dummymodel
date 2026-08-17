import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="min-h-screen bg-white px-6 py-12 dark:bg-zinc-950 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Blog
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            Latest Posts
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Stories, updates, and ideas worth sharing.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No posts published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {post.category}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold leading-snug text-zinc-950 transition group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300">
                    {post.title}
                  </h2>

                  <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-zinc-950 dark:text-white">
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}