import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/validators";
import { findUserByEmail, createUser } from "@/lib/auth/user";
import { hashPassword } from "@/lib/auth/hash";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid input",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    const session = await createSession(user.id, {
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    await setSessionCookie(session.token);

    return NextResponse.json(
      {
        ok: true,
        message: "Registration successful",
        user,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}