import Image from "next/image";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-20 text-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Services
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Design, development, and support.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            We help shape clear product ideas into refined digital experiences with steady guidance from start to finish.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/30 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-md lg:w-[320px]">
          <div className="relative h-72 w-full overflow-hidden rounded-[1.25rem]">
            <Image src="/images/service.jpg" alt="Services illustration" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </main>
  );
}
