import { LoginForm } from "@/components/LoginForm";
import { loginAction } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const next = params?.next;

  return <LoginForm action={loginAction} error={error} message={message} next={next} />;
}
