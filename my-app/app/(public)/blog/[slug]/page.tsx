import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Public visitors should only ever see published posts —
  // a missing post and a still-draft post both 404 the same way.
  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 dark:bg-zinc-950">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-6">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {post.category}
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            {post.title}
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            {formatDate(post.created_at)}
          </p>
        </div>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="mt-8 w-full rounded-xl object-cover"
          />
        )}

        <p className="mt-8 text-lg text-zinc-600 dark:text-zinc-400">
          {post.excerpt}
        </p>

        <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
          {post.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="whitespace-pre-wrap leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </article>
    </main>
  );
}