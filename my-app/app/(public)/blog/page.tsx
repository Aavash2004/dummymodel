import Link from "next/link";
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
    <main className="min-h-screen bg-white px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Blog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Latest Posts
          </h1>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              No posts published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-zinc-800">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center"
              >
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="h-40 w-full shrink-0 rounded-lg object-cover sm:h-24 sm:w-36"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-zinc-950 transition group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300">
                    {post.title}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}