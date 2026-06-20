"use client";

import AdminUserForm from "@/components/forms/admin-user-form";

export default function Page() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Novo usuário</h1>
        <p className="text-sm text-muted">Preencha os dados do novo usuário</p>
      </div>

      <AdminUserForm />
    </div>
  );
}
