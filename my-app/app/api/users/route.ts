import { NextResponse } from "next/server";
import { createUserRecord, findUserByEmailAndPassword } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action ?? "signup";
    const { name = "", email = "", password = "" } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    if (action === "login") {
      const user = await findUserByEmailAndPassword(email, password);
      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 200 });
      }

      return NextResponse.json({ success: true, fallback: user.fallback }, { status: 200 });
    }

    if (action === "signup") {
      if (!name) {
        return NextResponse.json({ error: "Missing name" }, { status: 400 });
      }

      const result = await createUserRecord(name, email, password);
      if (!result.success) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }

      return NextResponse.json({ success: true, fallback: result.fallback });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
