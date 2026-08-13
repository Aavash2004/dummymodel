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
  ListSortAscending,
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
  const [statusFilter, setStatusFilter] = useState<
    "All" | PostStatus
  >("All");

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

  const draftCount = posts.filter(
    (post) => post.status === "Draft"
  ).length;

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
        <p className="text-sm text-zinc-500">
          Loading...
        </p>
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

  return (
    <main className="min-h-screen bg-zinc-50/70 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back
              {user?.name
                ? `, ${user.name.split(" ")[0]}`
                : ""}
              .
            </h1>

            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Manage your blog posts and content from here.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user?.avatar_url ? (
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.name ?? "User"}
                />
              ) : null}

              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Total Posts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {posts.length}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Published
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {publishedCount}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Drafts */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Drafts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {draftCount}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <FileEdit className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Categories
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {new Set(posts.map((post) => post.category)).size}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <ListSortAscending className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <section className="rounded-2xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b p-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-semibold">
                Blog Posts
              </h2>

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
          <div className="flex  border-b p-6 dark:border-zinc-800 sm:flex-row">

            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={
                  statusFilter === "All"
                    ? "default"
                    : "outline"
                }
                onClick={() => setStatusFilter("All")}
              >
                All
              </Button>

              <Button
                variant={
                  statusFilter === "Published"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setStatusFilter("Published")
                }
              >
                Published
              </Button>

              <Button
                variant={
                  statusFilter === "Draft"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setStatusFilter("Draft")
                }
              >
                Drafts
              </Button>
            </div>
          </div>

          {/* Posts */}
          <div className="divide-y dark:divide-zinc-800">

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-zinc-400" />

                <h3 className="mt-4 font-semibold">
                  No posts found
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Try changing your search or create a new post.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 p-6 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Post information */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {post.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          post.status === "Published"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                      {post.excerpt}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">

                    <Button
                      variant="ghost"
                      size="icon"
                      title="View"
                      onClick={() =>
                        router.push(
                          `/blog/${post.id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md border">
                        <Button
                          variant="outline"
                          size="icon"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/posts/${post.id}/edit`
                            )
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() =>
                            setDeletePost(post)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletePost}
        onOpenChange={(open) => {
          if (!open) setDeletePost(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete post?
            </DialogTitle>

            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {deletePost?.title}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePost(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}