import { getSessionCookie } from "@/lib/auth/cookies";
import { getSessionWithUserByToken } from "@/lib/auth/session";

export async function requireUser() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  const session = await getSessionWithUserByToken(token);

  if (!session) {
    return null;
  }

  return session.user;
}