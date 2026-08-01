"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Toast, ToastViewport } from "@/app/components/ui/toast";
import { EyeIcon, EyeOffIcon, Sparkles, ArrowRight, Handshake } from "lucide-react";

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

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: keyof FormState, value: string) => {
    const nextForm = { ...form, [field]: value };
    const result = signupSchema.safeParse(nextForm);

    if (result.success) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        ...(field === "password" ? { confirmPassword: undefined } : {}),
      }));
      return;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors((prev) => ({
      ...prev,
      [field]: fieldErrors[field]?.[0],
      ...(field === "password" ? { confirmPassword: fieldErrors.confirmPassword?.[0] } : {}),
    }));
  };

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
    setIsSubmitting(true);

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
        if (data.error === "Email already exists" || data.error === "User already exists") {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setToast({ message: data.error || "Failed to save user.", type: "error" });
        }
        setIsSubmitting(false);
        return;
      }

      setToast({ message: "Account created successfully.", type: "success" });
      router.push("/auth/login");
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50/50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xs">
            <Handshake className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-950">Intern App</span>
        </div>

        <Card className="border border-zinc-200/80 bg-white p-0 shadow-md rounded-3xl">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-950">Create your account</CardTitle>
            <CardDescription className="text-sm text-zinc-500">Join Northstar with a few simple details.</CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) validateField("name", e.target.value);
                  }}
                  onBlur={(e) => validateField("name", e.target.value)}
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  className="rounded-xl border-zinc-200 bg-zinc-50/50"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) validateField("email", e.target.value);
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="rounded-xl border-zinc-200 bg-zinc-50/50"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password || errors.confirmPassword) validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-zinc-200 bg-zinc-50/50"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      if (errors.confirmPassword) validateField("confirmPassword", e.target.value);
                    }}
                    onBlur={(e) => validateField("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-zinc-200 bg-zinc-50/50"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p> : null}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-zinc-950 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 cursor-pointer mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating account..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-zinc-950 hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </main>
  );
}