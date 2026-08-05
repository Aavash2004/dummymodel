"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getUser, setUser, getToken, clearToken, clearUser } from "@/app/lib/auth-client";
import { User, Lock, Trash2, Save, Eye, EyeOff } from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name is too long.")
    .regex(/^[A-Za-z ]+$/, "Name may only contain letters and spaces."),
  email: z.string().trim().email("Please enter a valid email address."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string }>({});

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setProfileErrors({ name: fieldErrors.name?.[0], email: fieldErrors.email?.[0] });
      return;
    }
    setProfileErrors({});
    setSavingProfile(true);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          action: "update-profile",
          name: result.data.name,
          email: result.data.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        showMessage(data.error || "Failed to update profile.", "error");
        setSavingProfile(false);
        return;
      }

      // Keep localStorage in sync with the updated user
      if (data.user) {
        setUser(data.user);
      }

      showMessage("Profile updated.", "success");
    } catch {
      showMessage("Unable to reach the server right now.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setPasswordErrors({
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
      });
      return;
    }
    setPasswordErrors({});
    setSavingPassword(true);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: result.data.currentPassword,
          newPassword: result.data.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorText = data.error || "Failed to change password.";
        if (errorText.toLowerCase().includes("current password")) {
          setPasswordErrors({ currentPassword: errorText });
        } else if (errorText.toLowerCase().includes("new password")) {
          setPasswordErrors({ newPassword: errorText });
        } else {
          showMessage(errorText, "error");
        }
        setSavingPassword(false);
        return;
      }

      setPasswordErrors({});
      setCurrentPassword("");
      setNewPassword("");
      showMessage("Password changed.", "success");
    } catch {
      showMessage("Unable to reach the server right now.", "error");
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
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        showMessage(data.error || "Failed to delete account.", "error");
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }

      clearToken();
      clearUser();
      router.push("/");
    } catch {
      showMessage("Unable to reach the server right now.", "error");
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

      {message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {/* Profile section */}
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
              onChange={(e) => setName(e.target.value)}
              disabled={savingProfile}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
            {profileErrors.name ? <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={savingProfile}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
            {profileErrors.email ? <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p> : null}
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
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute inset-y-0 right-3 inline-flex items-center rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword ? (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
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
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute inset-y-0 right-3 inline-flex items-center rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.newPassword ? (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
            ) : null}
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
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
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
    </div>
  );
}