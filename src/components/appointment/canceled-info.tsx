import { AppointmentRow } from "@/actions/types/appointment";
import { maskCPF } from "@/lib/utils/masks";
import { Separator } from "@heroui/react";
import { UserXIcon, XCircleIcon } from "lucide-react";
import React from "react";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function CanceledInfo({
  appointment,
}: {
  appointment: AppointmentRow;
}) {
  return (
    <div className="flex flex-col gap-4 pb-2.5">
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-danger/5 border border-danger/20">
        <div className="flex items-center gap-2">
          <XCircleIcon size={13} className="text-danger shrink-0" />
          <p className="text-[10px] font-medium text-danger uppercase tracking-widest">
            Agendamento cancelado
          </p>
        </div>
        {appointment.cancelReason && (
          <p className="text-sm text-muted">{appointment.cancelReason}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted">
          {appointment.canceledBy && (
            <span className="flex items-center gap-1">
              <UserXIcon size={11} />
              {appointment.canceledBy.name}
            </span>
          )}
          {appointment.canceledAt && (
            <span>
              {new Date(appointment.canceledAt).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <DetailField label="Paciente">
          <p>{appointment.patient.name}</p>
          <p className="text-xs text-muted font-mono">
            {maskCPF(appointment.patient.cpf)}
          </p>
        </DetailField>

        <DetailField label="Data">
          {new Date(appointment.date).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}{" "}
          às {appointment.time}
        </DetailField>

        <DetailField label="Especialidade">
          {appointment.healthSpecialty.name}
        </DetailField>

        <DetailField label="Unidade">
          {appointment.healthUnit.unitName}
        </DetailField>
      </div>

      {appointment.hasCompanion && appointment.companion && (
        <DetailField label="Acompanhante">
          {appointment.companion.name}
        </DetailField>
      )}

      {appointment.observations && (
        <DetailField label="Observações">
          <p className="text-muted">{appointment.observations}</p>
        </DetailField>
      )}

      <Separator />

      <DetailField label="Cadastrado por">
        {appointment.createdBy.name}
      </DetailField>
    </div>
  );
}
