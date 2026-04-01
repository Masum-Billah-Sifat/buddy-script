import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import AuthShell from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";

export default async function RegisterPage() {
  const user = await requireUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <AuthShell imageUrl="/registration.png">
      <RegisterForm />
    </AuthShell>
  );
}