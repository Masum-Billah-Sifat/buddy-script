import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getSessionWithUserByToken } from "@/lib/auth/session";

export async function GET() {
  try {
    const token = await getSessionCookie();

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await getSessionWithUserByToken(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: session.user,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}