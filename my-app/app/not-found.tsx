import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50/50 px-6 py-20 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-4rem] top-[-2rem] h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-1/3 h-60 w-60 rounded-full bg-violet-300/35 blur-3xl" />
      </div>

      <div className="w-full max-w-lg rounded-[28px] border border-zinc-200/80 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-950/80 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950">
          <Home className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}
