"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@heroui/react";
import { ClockIcon, FileTextIcon, SaveIcon } from "lucide-react";
import {
  updateTransportSchema,
  type UpdateTransportFormData,
} from "@/lib/schemas/transport";
import { updateTransport } from "@/actions/transport";
import { listDrivers } from "@/actions/driver";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { InputTextField } from "@/components/ui/input-text-field";
import { SearchSelectField } from "@/components/ui/search-select-field";
import ButtonField from "@/components/ui/button-field";
import DetailField from "@/components/transport/detail-field";
import SectionLabel from "@/components/ui/section-label";
import { formSubmit } from "@/lib/form-submit";
import { maskPlate } from "@/lib/utils/masks";
import type { TransportRow } from "@/actions/types/transport";

export default function TransportEditForm({
  transport,
  afterSubmitAction,
}: {
  transport: TransportRow;
  afterSubmitAction: () => void;
}) {
  const [drivers, setDrivers] = useState<{ label: string; value: string }[]>(
    [],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTransportFormData>({
    resolver: zodResolver(updateTransportSchema),
    defaultValues: {
      departureTime: transport.departureTime,
      driverId: transport.driver.id,
      observations: transport.observations ?? "",
    },
  });

  useEffect(() => {
    async function load() {
      const result = await listDrivers(1, "", 999);
      if (result.success)
        setDrivers(
          result.data.drivers.map((d) => ({ label: d.name, value: d.id })),
        );
    }
    load().then();
  }, []);

  async function onSubmit(data: UpdateTransportFormData) {
    await formSubmit({
      action: () => updateTransport(transport.id, data),
      successMessage: "Transporte atualizado com sucesso",
      onSuccess: afterSubmitAction,
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 pb-2.5"
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Dados fixos</SectionLabel>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <DetailField label="Veículo">
            <p className="font-medium">{maskPlate(transport.vehicle.plate)}</p>
            <p className="text-xs text-muted">
              {transport.vehicle.brand} {transport.vehicle.model}
            </p>
          </DetailField>

          <DetailField label="Data">
            {new Date(transport.date).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })}
          </DetailField>
        </div>
        <p className="text-xs text-muted">
          O veículo e a data não podem ser alterados.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>Dados editáveis</SectionLabel>

        <Controller
          name="departureTime"
          control={control}
          render={({ field }) => (
            <InputMaskField
              variant="secondary"
              label="Horário de saída"
              placeholder="08:00"
              icon={ClockIcon}
              error={errors.departureTime?.message}
              masks={[{ mask: "00:00" }]}
              autoComplete="off"
              {...field}
            />
          )}
        />

        <Controller
          name="driverId"
          control={control}
          render={({ field }) => (
            <SearchSelectField
              label="Motorista"
              placeholder="Buscar motorista..."
              error={errors.driverId?.message}
              options={drivers}
              value={field.value}
              onChangeAction={field.onChange}
            />
          )}
        />

        <Controller
          name="observations"
          control={control}
          render={({ field }) => (
            <InputTextField
              variant="secondary"
              label="Observação"
              placeholder="Podem ser indicadas rotas ou informações auxiliares"
              icon={FileTextIcon}
              error={errors.observations?.message}
              autoComplete="off"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Salvar alterações"
        icon={SaveIcon}
      />
    </Form>
  );
}
