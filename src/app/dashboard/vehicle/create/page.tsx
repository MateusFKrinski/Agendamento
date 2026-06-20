"use client";

import VehicleForm from "@/components/forms/vehicle-form";

export default function Page() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Novo veículo</h1>
        <p className="text-sm text-muted">Preencha os dados do novo veículo</p>
      </div>

      <VehicleForm />
    </div>
  );
}
