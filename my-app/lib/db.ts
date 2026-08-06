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
