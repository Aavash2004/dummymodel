import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-20 text-zinc-800">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">Error 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
