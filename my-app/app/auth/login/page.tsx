"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Toast, ToastViewport } from "@/app/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setErrors({
          email: data.error === "Invalid credentials" ? "Invalid email or password." : undefined,
          password: data.error === "Invalid credentials" ? "Invalid email or password." : undefined,
        });
        setToast({ message: data.error || "Login failed.", type: "error" });
        return;
      }

      setToast({ message: "Logged in successfully.", type: "success" });
      router.push("/");
    } catch {
      setErrors({
        email: "Unable to reach the server right now.",
        password: "Unable to reach the server right now.",
      });
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_55%)] px-6 py-20">
      <Card className="w-full max-w-md border-white/60 bg-white/70 p-0 shadow-[0_20px_60px_rgba(2,4,1,0.08)] backdrop-blur-xl">
        <CardHeader className="p-8 pb-4">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">Login</p>
          <CardTitle className="mt-3 text-3xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your account.</CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
              {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
              {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password}</p> : null}
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-zinc-950">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </main>
  );
}
