import { TransportRow } from "@/actions/types/transport";
import { maskPlate } from "@/lib/utils/masks";
import { countPassengers } from "@/lib/utils/count-passengers";
import { ClockIcon, FileTextIcon, UserIcon, UsersIcon } from "lucide-react";
import { Button, Chip } from "@heroui/react";

interface TransportCardProps {
  transport: TransportRow;
  onGenerate: (transport: TransportRow) => void;
  generateLabel?: string;
}

export default function TransportCard({
  transport,
  onGenerate,
  generateLabel = "Gerar documento",
}: TransportCardProps) {
  const totalPassengers = countPassengers(
    transport.appointments.map((a) => ({
      patientId: a.appointment.patient.id,
      hasCompanion: a.appointment.hasCompanion,
      companionId: a.appointment.companion?.id ?? null,
    })),
  );
  const availableSeats = transport.vehicle.capacity - 1;
  const isFull = totalPassengers >= availableSeats;

  return (
    <div
      className={[
        "flex flex-col gap-2 px-4 py-3 rounded-2xl border transition-all",
        transport.isCanceled
          ? "border-danger/20 bg-danger/5 opacity-60"
          : "border-border bg-background",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={[
              "text-sm font-medium font-mono",
              transport.isCanceled
                ? "text-muted line-through"
                : "text-foreground",
            ].join(" ")}
          >
            {maskPlate(transport.vehicle.plate)}
          </span>
          <span className="text-xs text-muted">
            {transport.vehicle.brand} {transport.vehicle.model}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Chip size="sm" color={transport.isCanceled ? "danger" : "success"}>
            {transport.isCanceled ? "Cancelado" : "Ativo"}
          </Chip>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1">
          <ClockIcon size={10} />
          {transport.departureTime}
        </span>
        <span className="flex items-center gap-1">
          <UserIcon size={10} />
          {transport.driver.name}
        </span>
        <span
          className={
            isFull ? "text-danger font-medium" : "text-foreground font-medium"
          }
        >
          <UsersIcon size={10} className="inline mr-1" />
          {totalPassengers}/{availableSeats} vagas
        </span>
      </div>

      {!transport.isCanceled && (
        <Button
          variant="primary"
          className="w-full mt-1"
          onPress={() => onGenerate(transport)}
        >
          <FileTextIcon size={14} />
          {generateLabel}
        </Button>
      )}
    </div>
  );
}
