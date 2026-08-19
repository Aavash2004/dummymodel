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

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-14 dark:bg-zinc-950 sm:py-20">
      <article className="mx-auto max-w-5xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main content column */}
          <div>
            <div className="space-y-5 border-b border-zinc-200 pb-8 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <span>{post.category}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.created_at)}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

            <div
              className="prose prose-zinc mt-8 max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-zinc-950 prose-a:underline prose-a:underline-offset-2 dark:prose-invert dark:prose-a:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Image sidebar column */}
          {post.featured_image ? (
            <aside className="sm:sticky sm:top-10 sm:h-fit">
              <figure>
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                    priority
                  />
                </div>
              </figure>
            </aside>
          ) : null}
        </div>
      </article>
    </main>
  );
}