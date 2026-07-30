"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm text-white">
            ✦
          </span>
          <span>ABC</span>
        </Link>

        <div className="hidden items-center gap-2 text-sm text-zinc-600 sm:flex sm:gap-3">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50/80 px-2 py-1.5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-zinc-950">
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/auth/login" className="rounded-full border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100">
            Login
          </Link>
          <Link href="/auth/signup" className="rounded-full bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-800">
            Sign up
          </Link>
        </div>

        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/80 text-zinc-700 shadow-sm transition hover:bg-zinc-100"
            aria-label="Toggle navigation"
          >
            {open ? "✕" : "☰"}
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/70 bg-white/90 shadow-lg backdrop-blur-xl">
              <div className="flex flex-col gap-1 p-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-zinc-200" />
                <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
                  Login
                </Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)} className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
                  Sign up
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
