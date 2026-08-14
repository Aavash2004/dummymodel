import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
  username?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  avatar_url?: string | null;
};

type SafeUser = Omit<UserRecord, "password">;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const fallbackStoragePath = path.join(process.cwd(), ".data", "users.json");
let fallbackUsers: UserRecord[] = [];
let fallbackIdCounter = 1;
let fallbackUsersLoaded = false;
let fallbackUsersLoadPromise: Promise<void> | null = null;

async function ensureFallbackUsersLoaded() {
  if (fallbackUsersLoaded) return;

  if (!fallbackUsersLoadPromise) {
    fallbackUsersLoadPromise = (async () => {
      try {
        await fs.mkdir(path.dirname(fallbackStoragePath), { recursive: true });
        const raw = await fs.readFile(fallbackStoragePath, "utf8");
        const parsed = JSON.parse(raw) as Partial<UserRecord>[];

        fallbackUsers = parsed.filter((user): user is UserRecord => Boolean(user?.id && user?.email && user?.password));
        fallbackIdCounter = fallbackUsers.reduce((max, user) => Math.max(max, user.id), 0) + 1;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "ENOENT") {
          console.warn("Unable to load fallback users from disk.", error);
        }
        fallbackUsers = [];
        fallbackIdCounter = 1;
      } finally {
        fallbackUsersLoaded = true;
      }
    })();
  }

  await fallbackUsersLoadPromise;
}

async function saveFallbackUsers() {
  await fs.mkdir(path.dirname(fallbackStoragePath), { recursive: true });
  await fs.writeFile(fallbackStoragePath, JSON.stringify(fallbackUsers, null, 2), "utf8");
}

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDb(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set in production environment");
    }
    return false;
  }

  try {
    await query("SELECT 1");
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return true;
  } catch (error) {
    console.warn("Postgres unavailable, using fallback storage.", error);
    if (process.env.NODE_ENV === "production") {
      // In production we do not want a silent fallback to file storage.
      throw new Error(
        `Postgres unavailable in production environment: ${(error as Error).message}`
      );
    }
    return false;
  }
}

// Cache the DB-readiness check so it only actually runs once per server
// process, instead of on every single request.
let dbReadyPromise: Promise<boolean> | null = null;

export function ensureDb(): Promise<boolean> {
  if (!dbReadyPromise) {
    dbReadyPromise = initDb();
  }
  return dbReadyPromise;
}

function stripPassword(user: UserRecord): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function createUserRecord(name: string, email: string, password: string) {
  const isDbReady = await ensureDb();
  const hashedPassword = await bcrypt.hash(password, 12);

  if (!isDbReady) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database not available in production; fallback storage disabled.");
    }

    await ensureFallbackUsersLoaded();

    if (fallbackUsers.some((user) => user.email === email)) {
      return { success: false, duplicate: true, fallback: true } as const;
    }

    const newUser: UserRecord = {
      id: fallbackIdCounter++,
      name,
      email,
      password: hashedPassword,
    };
    fallbackUsers.push(newUser);
    await saveFallbackUsers();

    return { success: true, fallback: true, user: stripPassword(newUser) } as const;
  }

  const existing = await query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    return { success: false, duplicate: true, fallback: false } as const;
  }

  const result = await query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, hashedPassword]
  );

  return { success: true, fallback: false, user: result.rows[0] as SafeUser } as const;
}



export async function updateUserPassword(userId: number, currentPassword: string, newPassword: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database not available in production; fallback storage disabled.");
    }

    await ensureFallbackUsersLoaded();
    const user = fallbackUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: "User not found" } as const;

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return { success: false, error: "Current password is incorrect" } as const;

    user.password = await bcrypt.hash(newPassword, 12);
    await saveFallbackUsers();

    return { success: true } as const;
  }

  const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
  const user = result.rows[0] as UserRecord | undefined;
  if (!user) return { success: false, error: "User not found" } as const;

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) return { success: false, error: "Current password is incorrect" } as const;

  const hashedNew = await bcrypt.hash(newPassword, 12);
  await query("UPDATE users SET password = $1 WHERE id = $2", [hashedNew, userId]);

  return { success: true } as const;
}

export async function deleteUserAccount(userId: number) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database not available in production; fallback storage disabled.");
    }

    await ensureFallbackUsersLoaded();
    const index = fallbackUsers.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: "User not found" } as const;

    fallbackUsers.splice(index, 1);
    await saveFallbackUsers();

    return { success: true } as const;
  }

  const result = await query("DELETE FROM users WHERE id = $1", [userId]);
  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true } as const;
}

export async function findUserByEmailAndPassword(
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    await ensureFallbackUsersLoaded();

    const user = fallbackUsers.find(
      (entry) => entry.email === normalizedEmail
    );

    if (!user) return null;

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) return null;

    return {
      ...stripPassword(user),
      fallback: true,
    };
  }

  const result = await query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [normalizedEmail]
  );

  const user = result.rows[0] as UserRecord | undefined;

  if (!user) return null;

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) return null;

  return {
    ...stripPassword(user),
    fallback: false,
  };
}
export async function findUserById(userId: number) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    await ensureFallbackUsersLoaded();
    const user = fallbackUsers.find((u) => u.id === userId);
    if (!user) return null;
    return stripPassword(user);
  }

  const result = await query(
    "SELECT id, name, email, username, phone, address, avatar_url, created_at FROM users WHERE id = $1",
    [userId]
  );
  const user = result.rows[0] as SafeUser | undefined;
  return user || null;
}

export async function updateUserProfile(userId: number, name: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    await ensureFallbackUsersLoaded();
    const user = fallbackUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: "User not found" } as const;

    user.name = name;
    await saveFallbackUsers();

    return { success: true, user: stripPassword(user) } as const;
  }

  const result = await query(
    "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at",
    [name, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}

export async function updateUserContactInfo(
  userId: number,
  username: string,
  phone: string,
  address: string
) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    await ensureFallbackUsersLoaded();
    const user = fallbackUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: "User not found" } as const;

    user.username = username;
    user.phone = phone;
    user.address = address;
    await saveFallbackUsers();

    return { success: true, user: stripPassword(user) } as const;
  }

  const result = await query(
    "UPDATE users SET username = $1, phone = $2, address = $3 WHERE id = $4 RETURNING id, name, email, username, phone, address, created_at",
    [username, phone, address, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}
export async function updateUserAvatar(userId: number, avatarUrl: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    await ensureFallbackUsersLoaded();
    const user = fallbackUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: "User not found" } as const;

    user.avatar_url = avatarUrl;
    await saveFallbackUsers();

    return { success: true, user: stripPassword(user) } as const;
  }

  const result = await query(
    "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, username, phone, address, avatar_url, created_at",
    [avatarUrl, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  author_id: number | null;
  created_at: string;
  updated_at: string;
}

export async function getAllPosts() {
  const result = await query("SELECT * FROM posts ORDER BY created_at DESC");
  return result.rows as Post[];
}

export async function getPublishedPosts() {
  const result = await query(
    "SELECT * FROM posts WHERE status = 'PUBLISHED' ORDER BY created_at DESC"
  );
  return result.rows as Post[];
}

export async function getPostById(id: number) {
  const result = await query("SELECT * FROM posts WHERE id = $1", [id]);
  return (result.rows[0] as Post | undefined) || null;
}

export async function getPostBySlug(slug: string) {
  const result = await query(
    "SELECT * FROM posts WHERE slug = $1 AND status = 'PUBLISHED'",
    [slug]
  );
  return (result.rows[0] as Post | undefined) || null;
}

export async function isSlugTaken(slug: string, excludeId?: number) {
  if (excludeId) {
    const result = await query(
      "SELECT 1 FROM posts WHERE slug = $1 AND id != $2",
      [slug, excludeId]
    );
    return (result.rowCount ?? 0) > 0;
  }
  const result = await query("SELECT 1 FROM posts WHERE slug = $1", [slug]);
  return (result.rowCount ?? 0) > 0;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  authorId: number;
}) {
  const result = await query(
    `INSERT INTO posts (title, slug, excerpt, content, featured_image, category, status, author_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featuredImage || null,
      data.category,
      data.status,
      data.authorId,
    ]
  );
  return result.rows[0] as Post;
}

export async function updatePost(
  id: number,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    status: "DRAFT" | "PUBLISHED";
  }
) {
  const result = await query(
    `UPDATE posts
     SET title = $1, slug = $2, excerpt = $3, content = $4,
         featured_image = $5, category = $6, status = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featuredImage || null,
      data.category,
      data.status,
      id,
    ]
  );
  return (result.rows[0] as Post | undefined) || null;
}

export async function deletePost(id: number) {
  const result = await query("DELETE FROM posts WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
// --- Activity Log ---

export async function logActivity(
  action: string,
  description: string,
  userId: number | null
) {
  const result = await query(
    `INSERT INTO activity_log (action, description, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, action, description, user_id, created_at`,
    [action, description, userId]
  );
  return result.rows[0];
}

export async function getRecentActivity(limit: number = 10) {
  const result = await query(
    `SELECT id, action, description, user_id, created_at
     FROM activity_log
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function getDashboardStats() {
  const [usersResult, newUsersResult, postsResult, activityResult] =
    await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM users`),
      query(
        `SELECT COUNT(*)::int AS count FROM users
         WHERE created_at >= date_trunc('month', CURRENT_DATE)`
      ),
      query(`SELECT COUNT(*)::int AS count FROM posts`),
      query(`SELECT COUNT(*)::int AS count FROM activity_log`),
    ]);

  return {
    totalUsers: usersResult.rows[0].count,
    newUsers: newUsersResult.rows[0].count,
    totalPosts: postsResult.rows[0].count,
    totalActivity: activityResult.rows[0].count,
  };
}