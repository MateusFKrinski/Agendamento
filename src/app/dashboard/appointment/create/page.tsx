"use client";

import AppointmentForm from "@/components/forms/appointment-form";

export default function Page() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Novo agendamento
        </h1>
        <p className="text-sm text-muted">
          Preencha os dados para criar um novo agendamento
        </p>
      </div>

      <AppointmentForm />
    </div>
  );
}
