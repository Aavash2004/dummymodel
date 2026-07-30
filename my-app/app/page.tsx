import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

const photos = [
  { src: "/images/one.jpg", alt: "Abstract photo 1" },
  { src: "/images/2.jpg", alt: "Abstract photo 2" },
  { src: "/images/3.jpg", alt: "Abstract photo 3" },
  { src: "/images/eug.jpg", alt: "Abstract photo 4" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.03),_transparent_50%)] text-zinc-800">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-20 sm:py-28">
        <section className="grid gap-10 rounded-[2rem] border border-zinc-100 bg-white/60 p-8 shadow-sm backdrop-blur-sm md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              <span className="text-base">✦</span>
              <span>ShadCN-style UI</span>
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Thoughtful design, simplified.
            </h1>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              A calm, modern homepage with polished cards, smooth spacing, and a refined feel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/signup">Get started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">Explore more</Link>
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="relative h-80 w-full">
              <Image src={photos[0].src} alt={photos[0].alt} fill className="object-cover" />
            </div>
            <CardContent className="space-y-2">
              <CardTitle>Minimal, premium feel</CardTitle>
              <CardDescription>Bright surfaces, soft shadows, and layered content create a clean first impression.</CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {photos.slice(1).map((photo, index) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${index === 1 ? "-translate-y-3" : ""}`}
            >
              <div className="relative h-72 overflow-hidden">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-sm font-medium">Curated visual story</p>
                  <p className="text-xs text-white/80">Hover cards add depth and motion.</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
