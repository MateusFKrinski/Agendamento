"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@heroui/react";
import { PlusIcon, UsersIcon } from "lucide-react";
import {
  addAppointmentsToTransport,
  listPendingAppointments,
} from "@/actions/transport";
import type {
  TransportRow,
  PendingAppointmentRow,
} from "@/actions/types/transport";
import {
  addAppointmentsSchema,
  type AddAppointmentsFormData,
} from "@/lib/schemas/transport";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";
import { maskPlate } from "@/lib/utils/masks";
import { AppointmentCheckboxList } from "@/components/transport/appointment-checkbox-list";
import {
  countPassengers,
  toPassengerInput,
} from "@/lib/utils/count-passengers";

export default function AddAppointmentsForm({
  transport,
  afterSubmitAction,
}: {
  transport: TransportRow;
  afterSubmitAction: () => void;
}) {
  const [pendingAppointments, setPendingAppointments] = useState<
    PendingAppointmentRow[]
  >([]);
  const [loading, setLoading] = useState(true);

  const baseAppointments = transport.appointments.map((a) =>
    toPassengerInput(a.appointment),
  );
  const availableSeats = transport.vehicle.capacity - 1;

  useEffect(() => {
    async function load() {
      const dateStr = new Date(transport.date).toISOString().split("T")[0];
      const result = await listPendingAppointments(dateStr);
      if (result.success) setPendingAppointments(result.data.appointments);
      setLoading(false);
    }
    load().then();
  }, [transport.date]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddAppointmentsFormData>({
    resolver: zodResolver(addAppointmentsSchema),
    defaultValues: { appointmentIds: [] },
  });

  const selectedIds = watch("appointmentIds");

  const selectedInputs = pendingAppointments
    .filter((a) => selectedIds.includes(a.id))
    .map(toPassengerInput);

  const occupied = countPassengers([...baseAppointments, ...selectedInputs]);
  const remainingSeats = availableSeats - occupied;

  async function onSubmit(data: AddAppointmentsFormData) {
    await formSubmit({
      action: () => addAppointmentsToTransport(transport.id, data),
      successMessage: "Agendamentos adicionados com sucesso",
      onSuccess: afterSubmitAction,
    });
  }

  if (loading) {
    return (
      <p className="text-sm text-muted text-center py-6">
        Carregando agendamentos...
      </p>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-2.5"
    >
      <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-default">
        <p className="text-xs font-medium text-foreground">
          {maskPlate(transport.vehicle.plate)} — {transport.vehicle.brand}{" "}
          {transport.vehicle.model}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <UsersIcon size={11} />
          <span
            className={[
              "font-medium",
              remainingSeats < 0
                ? "text-danger"
                : remainingSeats === 0
                  ? "text-warning"
                  : "text-foreground",
            ].join(" ")}
          >
            {remainingSeats}
          </span>
          vagas restantes de {availableSeats} disponíveis
        </div>
      </div>

      {errors.appointmentIds?.message && (
        <p className="text-xs text-danger">{errors.appointmentIds.message}</p>
      )}

      {pendingAppointments.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          Nenhum agendamento pendente para esse dia
        </p>
      ) : (
        <Controller
          name="appointmentIds"
          control={control}
          render={({ field }) => (
            <AppointmentCheckboxList
              appointments={pendingAppointments}
              value={field.value}
              onChange={field.onChange}
              availableSeats={availableSeats}
              baseAppointments={baseAppointments}
            />
          )}
        />
      )}

      {pendingAppointments.length > 0 && (
        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Adicionar agendamentos"
          icon={PlusIcon}
        />
      )}
    </Form>
  );
}
