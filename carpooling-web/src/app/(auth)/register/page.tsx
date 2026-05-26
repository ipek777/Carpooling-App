import { RegisterForm } from "@/components/RegisterForm";
import { registerAction } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const next = params?.next;

  return <RegisterForm action={registerAction} error={error} next={next} />;
}
