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
    <main className="min-h-screen bg-zinc-50/50 px-6 py-12 sm:py-20 text-zinc-900">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Contact
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            Let’s talk about your next idea.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
            Reach out for questions, feedback, or simple collaboration.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Form Card */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Message Received</h3>
                <p className="text-sm text-zinc-600">
                  Thank you for reaching out! We will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="mt-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="rounded-xl border-zinc-200 bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="rounded-xl border-zinc-200 bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your message..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full rounded-full bg-zinc-950 py-3 text-sm font-semibold text-white hover:bg-zinc-800 cursor-pointer"
                >
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-zinc-950">Contact Info</h3>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hello@example.com</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-2xs">
              <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/con.jpg"
                  alt="Contact"
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
