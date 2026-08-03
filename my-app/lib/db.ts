import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

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

const fallbackUsers: UserRecord[] = [];
let fallbackIdCounter = 1;

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

export async function findUserByEmailAndPassword(email: string, password: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    const user = fallbackUsers.find((entry) => entry.email === email);
    if (!user) return null;

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return null;

    return { ...stripPassword(user), fallback: true };
  }

  const result = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  const user = result.rows[0] as UserRecord | undefined;
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return null;

  return { ...stripPassword(user), fallback: false };
}