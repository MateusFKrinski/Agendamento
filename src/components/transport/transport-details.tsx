"use client";

import { useState } from "react";
import { Button, Chip, Separator, Spinner, toast } from "@heroui/react";
import { Trash2Icon, UsersIcon, XCircleIcon } from "lucide-react";
import type { TransportRow } from "@/actions/types/transport";
import { removeAppointmentFromTransport } from "@/actions/transport";
import { maskPlate } from "@/lib/utils/masks";
import SectionLabel from "@/components/ui/section-label";
import DetailField from "@/components/transport/detail-field";
import { countPassengers } from "@/lib/utils/count-passengers";

type DetailAppointment = TransportRow["appointments"][number]["appointment"];

type GroupedUnit = {
  healthUnit: DetailAppointment["healthUnit"];
  patients: {
    patient: DetailAppointment["patient"];
    companion: DetailAppointment["companion"];
    hasCompanion: boolean;
    appointments: DetailAppointment[];
  }[];
};

function groupByUnitAndPatient(
  appointments: TransportRow["appointments"],
): GroupedUnit[] {
  const unitMap = new Map<string, GroupedUnit>();

  for (const { appointment } of appointments) {
    const unitId = appointment.healthUnit.id;
    if (!unitMap.has(unitId)) {
      unitMap.set(unitId, { healthUnit: appointment.healthUnit, patients: [] });
    }
    const unit = unitMap.get(unitId)!;

    const patientEntry = unit.patients.find(
      (p) => p.patient.id === appointment.patient.id,
    );
    if (patientEntry) {
      patientEntry.appointments.push(appointment);
    } else {
      unit.patients.push({
        patient: appointment.patient,
        companion: appointment.companion,
        hasCompanion: appointment.hasCompanion,
        appointments: [appointment],
      });
    }
  }

  return Array.from(unitMap.values());
}

export default function TransportDetails({
  transport,
  afterRemoveAction,
}: {
  transport: TransportRow;
  afterRemoveAction?: () => void;
}) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(appointmentId: string) {
    setRemovingId(appointmentId);
    const result = await removeAppointmentFromTransport(
      transport.id,
      appointmentId,
    );
    setRemovingId(null);

    if (result.success) {
      toast.success("Agendamento removido do transporte");
      afterRemoveAction?.();
    } else {
      toast.danger(result.error);
    }
  }

  const totalPassengers = countPassengers(
    transport.appointments.map((a) => ({
      patientId: a.appointment.patient.id,
      hasCompanion: a.appointment.hasCompanion,
      companionId: a.appointment.companion?.id ?? null,
    })),
  );
  const availableSeats = transport.vehicle.capacity - 1;
  const isFull = totalPassengers >= availableSeats;

  const groupedUnits = groupByUnitAndPatient(transport.appointments);

  return (
    <div className="flex flex-col gap-4 pb-2.5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <DetailField label="Veículo">
          <p className="font-medium">{maskPlate(transport.vehicle.plate)}</p>
          <p className="text-xs text-muted">
            {transport.vehicle.brand} {transport.vehicle.model}
          </p>
        </DetailField>

        <DetailField label="Motorista">{transport.driver.name}</DetailField>

        <DetailField label="Data">
          {new Date(transport.date).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </DetailField>

        <DetailField label="Saída">{transport.departureTime}</DetailField>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-default">
        <UsersIcon size={14} className="text-muted shrink-0" />
        <span className="text-xs text-muted">
          <span
            className={[
              "font-medium",
              isFull ? "text-danger" : "text-foreground",
            ].join(" ")}
          >
            {totalPassengers}
          </span>
          /{availableSeats} vagas ocupadas
        </span>
      </div>

      {transport.observations && (
        <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-default">
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Observação
          </p>
          <p className="text-sm text-foreground whitespace-pre-line">
            {transport.observations}
          </p>
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <SectionLabel>
          {`Passageiros — ${transport.appointments.length} agendamento${transport.appointments.length !== 1 ? "s" : ""}`}
        </SectionLabel>

        {groupedUnits.map((unit) => (
          <div key={unit.healthUnit.id} className="flex flex-col gap-2">
            <p className="text-[10px] font-medium text-muted uppercase tracking-widest">
              {unit.healthUnit.unitName}
            </p>

            {unit.patients.map((entry) => (
              <div
                key={entry.patient.id}
                className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-default"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {entry.patient.name}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {entry.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted flex-1 min-w-0">
                        <span>{appointment.time}</span>
                        <span>—</span>
                        <span>{appointment.healthSpecialty.name}</span>
                        {appointment.hasCompanion && appointment.companion && (
                          <Chip size="sm" color="default">
                            + {appointment.companion.name.split(" ")[0]}
                          </Chip>
                        )}
                      </div>

                      {!transport.isCanceled && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Remover agendamento do transporte"
                          isDisabled={removingId !== null}
                          onPress={() => handleRemove(appointment.id)}
                          className="text-danger hover:bg-danger/10 shrink-0"
                        >
                          {removingId === appointment.id ? (
                            <Spinner className="text-danger" />
                          ) : (
                            <Trash2Icon size={14} />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {transport.isCanceled && (
        <>
          <Separator />
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-danger/5 border border-danger/20">
            <div className="flex items-center gap-2">
              <XCircleIcon size={13} className="text-danger shrink-0" />
              <p className="text-[10px] font-medium text-danger uppercase tracking-widest">
                Cancelado
              </p>
            </div>
            {transport.cancelReason && (
              <p className="text-sm text-muted">{transport.cancelReason}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted">
              {transport.canceledBy && <span>{transport.canceledBy.name}</span>}
              {transport.canceledAt && (
                <span>
                  {new Date(transport.canceledAt).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      <DetailField label="Criado por">{transport.createdBy.name}</DetailField>
    </div>
  );
}
