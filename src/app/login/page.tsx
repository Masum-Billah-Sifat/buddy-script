import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await requireUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <AuthShell imageUrl="/login.png">
      <LoginForm />
    </AuthShell>
  );
}