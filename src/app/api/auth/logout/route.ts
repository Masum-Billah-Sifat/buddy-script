import { NextResponse } from "next/server";
import { getSessionCookie, clearSessionCookie } from "@/lib/auth/cookies";
import { revokeSessionByToken } from "@/lib/auth/session";

export async function POST() {
  try {
    const token = await getSessionCookie();

    if (token) {
      await revokeSessionByToken(token);
    }

    await clearSessionCookie();

    return NextResponse.json({
      ok: true,
      message: "Logout successful",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}