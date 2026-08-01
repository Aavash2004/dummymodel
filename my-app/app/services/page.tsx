import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-zinc-50/50 px-6 py-12 sm:py-20 text-zinc-900">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Services
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            Design, development, and support.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
            We help shape product ideas into clear, functional applications with clean structure.
          </p>
        </div>

        {/* Image Showcase */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-2xs">
          <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96">
            <Image
              src="/images/service.jpg"
              alt="Services showcase"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Clean Overview Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs space-y-6 sm:p-10">
          <h2 className="text-2xl font-bold text-zinc-950">Our Approach</h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            We deliver straightforward solutions tailored to your requirements, prioritizing usability, performance, and clean code standards.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <span>Get in touch</span>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
