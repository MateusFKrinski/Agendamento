"use client";

import HealthUnitForm from "@/components/forms/health-unit-form";

export default function Page() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Nova unidade de saúde
        </h1>
        <p className="text-sm text-muted">
          Preencha os dados para cadastrar uma nova unidade
        </p>
      </div>

      <HealthUnitForm />
    </div>
  );
}
