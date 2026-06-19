import TransportForm from "@/components/forms/transport-form";

export default function Page() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Novo transporte
        </h1>
        <p className="text-sm text-muted">
          Selecione a data para ver os agendamentos pendentes
        </p>
      </div>

      <TransportForm />
    </div>
  );
}
