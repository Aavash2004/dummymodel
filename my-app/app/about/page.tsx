import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50/50 px-6 py-12 sm:py-20 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            About
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            Simple ideas, thoughtfully made.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
            We focus on clean interfaces, clear layout structure, and web applications that feel easy and direct to use.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold text-zinc-950">Our Focus</h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              We eliminate unnecessary clutter and focus on what matters: straightforward user navigation, fast page loads, and maintainable code.
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              Every page is designed with clean typography, responsive layouts, and typed React components.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <span>View services</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
                <Image
                  src="/images/about.jpg"
                  alt="About project"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
