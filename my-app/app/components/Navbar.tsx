"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Menu, Handshake, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const TRANSITION_MS = 250;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Mobile drawer states
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  const openDrawer = () => {
    setMounted(true);
    setOpen(true);
  };

  const closeDrawer = () => {
    setVisible(false);
    setOpen(false);
    window.setTimeout(() => setMounted(false), TRANSITION_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 px-4 pt-3 sm:px-6",
          scrolled ? "pt-2" : "pt-4"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full border transition-all duration-300 px-4 py-2.5 sm:px-6",
            scrolled
              ? "border-zinc-200/80 bg-white/90 shadow-md backdrop-blur-xl ring-1 ring-black/5"
              : "border-zinc-200/60 bg-white/75 shadow-sm backdrop-blur-lg"
          )}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 transition hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xs">
              <Handshake className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-zinc-950">Intern App</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 text-sm sm:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-zinc-100 text-zinc-950 font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100/60 hover:text-zinc-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Action CTAs */}
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/auth/login"
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              Log in
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white shadow-xs transition duration-200 hover:bg-zinc-800"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 sm:hidden active:scale-95"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay & Content */}
      {mounted && (
        <>
          <div
            onClick={closeDrawer}
            aria-hidden="true"
            className={cn(
              "fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity duration-300 sm:hidden",
              visible ? "opacity-100" : "opacity-0"
            )}
          />

          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed inset-y-0 right-0 z-[100] flex h-full w-[85%] max-w-sm flex-col bg-white/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out sm:hidden border-l border-zinc-100",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-950"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white">
                  <Handshake className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-tight text-zinc-950">Intern App</span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 overflow-y-auto px-6 py-4">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeDrawer}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-lg font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 font-semibold text-zinc-950"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-zinc-900" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="mt-auto flex flex-col gap-2.5 border-t border-zinc-100 p-6 bg-zinc-50/50">
              <Link
                href="/auth/login"
                onClick={closeDrawer}
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeDrawer}
                className="w-full rounded-full bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800"
              >
                Sign up
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}