"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  getUser,
  type StoredUser,
} from "@/app/lib/auth-client";

import {
  FileText,
  Users,
  UserPlus,
  Activity as ActivityIcon,
  ArrowRight,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  totalUsers: number;
  newUsers: number;
  totalPosts: number;
  totalActivity: number;
};

type ActivityRecord = {
  id: number;
  action: string;
  description: string;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: "New user",
  POST_CREATED: "Post created",
  POST_UPDATED: "Post updated",
  POST_DELETED: "Post deleted",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setUser(getUser());
    setChecked(true);

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !activityRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const statsData = await statsRes.json();
        const activityData = await activityRes.json();

        setStats(statsData);
        setActivity(activityData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    );
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const statItems = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
    },
    {
      label: "New Users This Month",
      value: stats?.newUsers,
      icon: UserPlus,
    },
    {
      label: "Blog Posts",
      value: stats?.totalPosts,
      icon: FileText,
    },
    {
      label: "Total Activity",
      value: stats?.totalActivity,
      icon: ActivityIcon,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
        </div>

        {error && (
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            {error}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account */}
          <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold">Account</h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {user?.avatar_url ? (
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.name ?? "User"}
                    />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user?.name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/profile")}
              >
                View Profile
              </Button>
            </div>
          </section>
        </div>

        {/* Blog management link — CRUD lives on its own page */}
        <section className="rounded-lg border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Blog Posts</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {loading
                  ? "Loading..."
                  : `${stats?.totalPosts ?? 0} post${
                      stats?.totalPosts === 1 ? "" : "s"
                    } total.`}
              </p>
            </div>
            <Link href="/dashboard/posts">
              <Button variant="outline" size="sm" className="gap-2">
                Manage Posts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}