import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createUserRecord, deleteUserAccount, findUserByEmailAndPassword, updateUserProfile, updateUserPassword } from "@/lib/db";
import { verifyToken } from "@/app/lib/auth-server";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters.")
    .max(72, "New password is too long."), // bcrypt has a 72-byte limit
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email address."),
});

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  let body: {
    action?: string;
    name?: string;
    email?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action, name, email, password } = body;

  if (!action || !email || !password) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (action === "signup") {
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    try {
      const result = await createUserRecord(name, email, password);
      if (!result.success) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }

      const token = jwt.sign(
        { userId: result.user.id, email: result.user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json(
        { success: true, user: result.user, token },
        { status: 201 }
      );
    } catch (error) {
      console.error("Signup error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  if (action === "login") {
    try {
      const user = await findUserByEmailAndPassword(email, password);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({ success: true, user, token }, { status: 200 });
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const payload = verifyToken(request.headers.get("authorization"));
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action } = body;

 if (action === "update-profile") {
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;
  const result = await updateUserProfile(payload.userId, name, email);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ success: true, user: result.user }, { status: 200 });
}

 if (action === "change-password") {
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  const result = await updateUserPassword(payload.userId, currentPassword, newPassword);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const payload = verifyToken(request.headers.get("authorization"));
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteUserAccount(payload.userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}