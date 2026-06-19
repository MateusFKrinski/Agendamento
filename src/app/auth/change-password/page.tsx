"use client";

import { useSearchParams } from "next/navigation";
import AuthChangePasswordForm from "@/components/forms/auth-change-password-form";

const REASON_MESSAGES = {
  "first-login":
    "Você está usando uma senha provisória, defina uma senha pessoal para continuar",
  "password-reset":
    "Sua senha foi redefinida pelo administrador, crie uma nova senha para continuar",
} as const;

type Reason = keyof typeof REASON_MESSAGES;

export default function Page() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as Reason | null;
  const message = reason ? REASON_MESSAGES[reason] : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Redefinir senha
            </h1>
            <p className="text-sm text-muted">{message}</p>
          </div>
        </div>

        <AuthChangePasswordForm />
      </div>
    </main>
  );
}
