"use client";

import AuthLoginForm from "@/components/forms/auth-login-form";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Bem-vindo
            </h1>
            <p className="text-sm text-muted">
              Acesse o sistema com suas credenciais
            </p>
          </div>

          <AuthLoginForm />
        </div>
      </div>
    </main>
  );
}
