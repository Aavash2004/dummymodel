"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getUser,
  type StoredUser,
} from "@/app/lib/auth-client";

import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  FileEdit,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PostStatus = "Published" | "Draft";

type Post = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  status: PostStatus;
  date: string;
};

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Exploring Kathmandu",
    excerpt: "A guide to exploring the cultural heart of Nepal.",
    category: "Travel",
    status: "Published",
    date: "Aug 13, 2026",
  },
  {
    id: 2,
    title: "The Beauty of Nepal",
    excerpt: "Discovering the landscapes, culture and people of Nepal.",
    category: "Travel",
    status: "Published",
    date: "Aug 11, 2026",
  },
  {
    id: 3,
    title: "My Journey as a Developer",
    excerpt: "Lessons learned while building modern web applications.",
    category: "Development",
    status: "Draft",
    date: "Aug 9, 2026",
  },
  {
    id: 4,
    title: "Getting Started with Next.js",
    excerpt: "A beginner-friendly introduction to Next.js.",
    category: "Development",
    status: "Published",
    date: "Aug 7, 2026",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PostStatus>(
    "All"
  );

  const [deletePost, setDeletePost] = useState<Post | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setUser(getUser());
    setChecked(true);
  }, [router]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter(
    (post) => post.status === "Published"
  ).length;

  const draftCount = posts.filter((post) => post.status === "Draft").length;

  const handleDelete = () => {
    if (!deletePost) return;

    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== deletePost.id)
    );

    setDeletePost(null);
  };

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
          Loading...
        </div>
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

  const stats = [
    {
      label: "Total Posts",
      value: posts.length,
      icon: FileText,
      accent:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: CheckCircle2,
      accent:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: FileEdit,
      accent:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
    {
      label: "Categories",
      value: new Set(posts.map((post) => post.category)).size,
      icon: ListOrdered,
      accent:
        "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50/70 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Background wash — matches private-area palette (rose/amber/blue) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-500/10" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" />
      </div>

      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-xl uppercase tracking-widest text-zinc-500">
              BLOGS
            </p>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Manage your blog posts and content from here.
            </p>
          </div>

          
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-2xl border bg-white p-6 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Posts Section */}
        <section className="rounded-2xl border bg-white  dark:border-zinc-800 dark:bg-zinc-900">
          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b p-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Blog Posts</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Create, edit and manage your blog posts.
              </p>
            </div>

            <Button
              onClick={() => router.push("/dashboard/posts/new")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col gap-4 border-b p-6 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === "All" ? "default" : "outline"}
                onClick={() => setStatusFilter("All")}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>

              <Button
                variant={statusFilter === "Published" ? "default" : "outline"}
                onClick={() => setStatusFilter("Published")}
                className="flex-1 sm:flex-none"
              >
                Published
              </Button>

              <Button
                variant={statusFilter === "Draft" ? "default" : "outline"}
                onClick={() => setStatusFilter("Draft")}
                className="flex-1 sm:flex-none"
              >
                Drafts
              </Button>
            </div>
          </div>

          {/* Posts */}
          <div className="divide-y dark:divide-zinc-800">
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <FileText className="h-6 w-6 text-zinc-400" />
                </div>

                <h3 className="font-semibold">No posts found</h3>

                <p className="max-w-xs text-sm text-zinc-500">
                  Nothing matches your search or filter yet. Try clearing them,
                  or create your first post.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-2"
                  onClick={() => router.push("/dashboard/posts/new")}
                >
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative flex flex-col gap-4 py-5 pl-6 pr-6 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      inproces
                    </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>  
    </main>
  );
}