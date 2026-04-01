import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";

export default async function HomePage() {
  const user = await requireUser();

  if (user) {
    redirect("/feed");
  }

  redirect("/login");
}