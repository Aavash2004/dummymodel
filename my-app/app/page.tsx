import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code, ShieldCheck, Zap, Handshake } from "lucide-react";

const photos = [
  { src: "/images/one.jpg", alt: "Photo 1" },
  { src: "/images/2.jpg", alt: "Photo 2" },
  { src: "/images/3.jpg", alt: "Photo 3" },
  { src: "/images/eug.jpg", alt: "Photo 4" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50/50 px-6 py-12 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100 sm:py-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-1/3 h-60 w-60 rounded-full bg-violet-300/35 blur-3xl" />
      </div>
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100">
            <Handshake className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
            <span>Intern App</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
            Thoughtful design & <br className="hidden sm:inline" />
            <span className="text-zinc-600">simplified workflows.</span>
          </h1>

          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
            A minimalist web application built with modern Next.js routes, clean UI components, and reliable backend integration.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/auth/signup"
              className="group flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>

            <Link
              href="/about"
              className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Learn more
            </Link>
          </div>
        </section>

        {/* Full-Width Video Banner Section with "LEARN" in the Middle */}
        <section className="relative left-1/2 right-1/2 -ml-[50vw]  -mr-[50vw] w-screen h-72 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-zinc-200/80 my-12 dark:border-zinc-700/60">
          {/* Continuously Playing Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-100"
          >
            <source
              src="/images/mmm.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {/* Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-black/30 backdrop-brightness-90" />

          {/* Centered Word "LEARN" */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <span className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-white uppercase drop-shadow-lg select-none">
                LEARN
              </span>
              <span className="h-1 w-12 rounded-full bg-white/80" />
            </div>
          </div>
        </section>

        {/* Gallery Showcase Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <Image
                src={photos[0].src}
                alt={photos[0].alt}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">Minimal UI Elements</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Clean card structures, clear typography, and balanced spacing.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <Image
                src={photos[1].src}
                alt={photos[1].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <h2 className="text-lg font-bold text-zinc-950">Focused Experience</h2>
              <p className="text-sm text-zinc-600">Uncluttered interface designed around core user actions.</p>
            </div>
          </div>
        </section>

        {/* Key Pillars */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">Fast & Responsive</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Built on React 19 and Next.js App Router for immediate page navigation.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100">
              <Code className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">Clean Codebase</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Structured TypeScript components using standard utility-first CSS.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">Secure Auth</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              PostgreSQL database integration with bcrypt password hashing.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}