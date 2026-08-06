"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getToken, clearToken, clearUser } from "@/app/lib/auth-client";
import { Toast, ToastViewport } from "@/app/components/ui/toast";
import { Lock, Trash2, AlertTriangle, X, EyeIcon, EyeOffIcon } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ currentPassword, newPassword });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setCurrentPasswordError(fieldErrors.currentPassword?.[0]);
      setNewPasswordError(fieldErrors.newPassword?.[0]);
      return;
    }
    setCurrentPasswordError(undefined);
    setNewPasswordError(undefined);
    setSavingPassword(true);

    try {
      const response = await fetch("/api/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: result.data.currentPassword,
          newPassword: result.data.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to change password.", type: "error" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setToast({ message: "Password changed.", type: "success" });
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await fetch("/api/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to delete account.", type: "error" });
        setDeleting(false);
        setShowDeleteDialog(false);
        return;
      }

      clearToken();
      clearUser();
      router.push("/");
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-10 sm:py-14">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Settings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Account settings.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Manage your password and account preferences.
        </p>
      </div>

      {/* Password section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Lock className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError(undefined);
                }}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
              </button>
            </div>
            {currentPasswordError ? (
              <p className="mt-1 text-xs text-red-600">{currentPasswordError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError(undefined);
                }}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
              </button>
            </div>
            {newPasswordError ? <p className="mt-1 text-xs text-red-600">{newPasswordError}</p> : null}
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Lock className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-2xs dark:border-red-900/60 dark:bg-red-950/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Trash2 className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Account Delection</h2>
        </div>
        <p className="mb-4 text-sm text-red-700/80 dark:text-red-400/80">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteDialog(false)}
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
          >
            <button
              type="button"
              onClick={() => !deleting && setShowDeleteDialog(false)}
              disabled={deleting}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 id="delete-dialog-title" className="text-lg font-bold text-zinc-950 dark:text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              This action is permanent. All your data, including your profile and session history, will be
              deleted immediately and cannot be recovered.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700/60 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </div>
  );
}