import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import FeedClient from "./feed-client";

export default async function FeedPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return <FeedClient user={user} />;
}