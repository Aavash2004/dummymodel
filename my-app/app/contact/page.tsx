"use client";

import Image from "next/image";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50/50 px-6 py-12 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100 sm:py-20">
      {/* Decorative background blobs for glass effect to catch */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/20" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />

      <div className="relative mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Contact
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            Let&apos;s talk about your next idea.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Reach out for questions, feedback, or simple collaboration.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Form Card — Glassmorphism */}
          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/30 p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 lg:col-span-7">
            {/* Inner top highlight for glass sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10" />

            <div className="relative">
              {submitted ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600 backdrop-blur-sm dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                    Message Received
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Thank you for reaching out! We will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="mt-2 rounded-full border border-white/40 bg-white/40 px-4 py-2 text-xs font-semibold text-zinc-800 backdrop-blur-sm transition hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="rounded-xl border-white/40 bg-white/40 backdrop-blur-sm placeholder:text-zinc-500 focus:border-zinc-900 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="rounded-xl border-white/40 bg-white/40 backdrop-blur-sm placeholder:text-zinc-500 focus:border-zinc-900 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Your message..."
                      className="w-full rounded-xl border border-white/40 bg-white/40 p-3 text-sm text-zinc-900 placeholder:text-zinc-500 backdrop-blur-sm focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full cursor-pointer rounded-full bg-zinc-950/90 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-zinc-800 dark:bg-white/90 dark:text-zinc-950 dark:hover:bg-white"
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Contact Info
              </h3>
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hello@example.com</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                <Image src="/images/con.jpg" alt="Contact" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}