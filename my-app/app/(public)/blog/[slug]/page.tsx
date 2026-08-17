import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
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
    <main className="min-h-screen bg-white px-6 py-12 dark:bg-zinc-950 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-8 space-y-4">
          <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {post.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.created_at)}
          </div>
        </div>

        {post.featured_image ? (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(min-width: 672px) 672px, 100vw"
              priority
            />
          </div>
        ) : null}

        <p className="mt-10 text-xl leading-relaxed text-zinc-700 dark:text-zinc-300">
          {post.excerpt}
        </p>

        <div
          className="prose prose-zinc mt-8 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-zinc-950 dark:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}