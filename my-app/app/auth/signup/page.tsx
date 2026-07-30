"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Toast, ToastViewport } from "@/app/components/ui/toast";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save user");
      }

      setToast({ message: "Account created successfully.", type: "success" });
      router.push("/auth/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save user.";
      setToast({ message, type: "error" });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_55%)] px-6 py-20">
      <Card className="w-full max-w-md border-white/60 bg-white/70 p-0 shadow-[0_20px_60px_rgba(2,4,1,0.08)] backdrop-blur-xl">
        <CardHeader className="p-8 pb-4">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">Sign up</p>
          <CardTitle className="mt-3 text-3xl">Create your account</CardTitle>
          <CardDescription>Join us with a few simple details.</CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
              {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name}</p> : null}
            </div>

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

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Confirm Password</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {errors.confirmPassword ? <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p> : null}
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-zinc-950">
              Login
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
