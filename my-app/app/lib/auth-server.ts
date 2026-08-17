import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface TokenPayload {
  userId: number;
  email: string;
  role: "user"|"admin"
}

export function verifyToken(authHeader: string | null): TokenPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
export function requireAdmin(payload: TokenPayload | null):boolean {
 return payload?.role ==="admin";
}