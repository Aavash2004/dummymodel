import bcrypt from "bcrypt";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const fallbackUsers: UserRecord[] = [];
let fallbackIdCounter = 0;
let dbReadyPromise: Promise<boolean> | null = null;

function getFallbackUsers() {
  return fallbackUsers;
}

export async function query(text: string, params?: unknown[]) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initDb() {
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

export async function ensureDb() {
  if (!dbReadyPromise) {
    dbReadyPromise = initDb();
  }
  return dbReadyPromise;
}

export async function createUserRecord(name: string, email: string, password: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    if (getFallbackUsers().some((user) => user.email === email)) {
      return { success: false, duplicate: true, fallback: true };
    }

    fallbackIdCounter += 1;
    getFallbackUsers().push({
      id: fallbackIdCounter,
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });

    return { success: true, fallback: true };
  }

  const existing = await query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    return { success: false, duplicate: true, fallback: false };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [
    name,
    email,
    hashedPassword,
  ]);

  return { success: true, fallback: false };
}

export async function findUserByEmailAndPassword(email: string, password: string) {
  const isDbReady = await ensureDb();

  if (!isDbReady) {
    const user = getFallbackUsers().find((entry) => entry.email === email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const { password: _pw, ...safeUser } = user;
    return { ...safeUser, fallback: true };
  }

  const result = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  const user = result.rows[0];

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const { password: _pw, ...safeUser } = user;
  return { ...safeUser, fallback: false };
}
