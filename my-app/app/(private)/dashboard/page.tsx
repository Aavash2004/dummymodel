"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearToken, clearUser } from "@/app/lib/auth-client";
import { LogOut, User, Mail, ShieldCheck, Clock } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [user, setLocalUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    setLocalUser(getUser());
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    clearToken();
    clearUser();
    router.push("/");
  };

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50/50 px-6 py-12 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100 sm:py-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-1/3 h-60 w-60 rounded-full bg-violet-300/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Account
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              You&apos;re signed in and ready to go. Manage your account or head back to the site.
            </p>
          </div>
        </div>

        {/* Profile Card */}
       <div className="rounded-3xl border border-white/50 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <User className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                {user?.name || "You're logged in"}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.email || "This page is only visible to authenticated users."}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Session details
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Secure Session</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your login is protected with a signed token stored locally on this device.
              </p>
            </div>

            <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Stays Signed In</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                You&apos;ll remain logged in across page reloads until you log out.
              </p>
            </div>

            <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Need Help?</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Reach out any time from the Contact page if something looks off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}