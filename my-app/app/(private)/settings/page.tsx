"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getUser, setUser, getToken, clearToken, clearUser } from "@/app/lib/auth-client";
import { Toast, ToastViewport } from "@/app/components/ui/toast";
import { User, Lock, Trash2, Save } from "lucide-react";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name is too long."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [nameError, setNameError] = useState<string | undefined>();
  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse({ name });

    if (!result.success) {
      setNameError(result.error.issues[0].message);
      return;
    }
    setNameError(undefined);
    setSavingProfile(true);

    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: result.data.name }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to update profile.", type: "error" });
        return;
      }

      if (data.user) {
        setUser(data.user);
      }

      setToast({ message: "Profile updated.", type: "success" });
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

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
        setConfirmDelete(false);
        return;
      }

      clearToken();
      clearUser();
      router.push("/");
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
      setDeleting(false);
      setConfirmDelete(false);
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
          Manage your profile, password, and account preferences.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              disabled={savingProfile}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
            {nameError ? <p className="mt-1 text-xs text-red-600">{nameError}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Email Address
            </label>
            <p className="rounded-xl border border-zinc-200 bg-zinc-100/50 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-500">
              {email}
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

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
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (currentPasswordError) setCurrentPasswordError(undefined);
              }}
              placeholder="••••••••"
              disabled={savingPassword}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
            {currentPasswordError ? (
              <p className="mt-1 text-xs text-red-600">{currentPasswordError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (newPasswordError) setNewPasswordError(undefined);
              }}
              placeholder="••••••••"
              disabled={savingPassword}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
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

      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-2xs dark:border-red-900/60 dark:bg-red-950/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Trash2 className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Account Deletion</h2>
        </div>
        <p className="mb-4 text-sm text-red-700/80 dark:text-red-400/80">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {deleting
            ? "Deleting..."
            : confirmDelete
            ? "Click again to confirm delete"
            : "Delete account"}
        </button>
      </div>

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </div>
  );
}