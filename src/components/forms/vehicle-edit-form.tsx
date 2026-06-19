"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateVehicleSchema,
  type UpdateVehicleFormData,
} from "@/lib/schemas/vehicle";
import { updateVehicle } from "@/actions/vehicle";
import { Form } from "@heroui/react";
import { CarIcon, TagIcon, PaletteIcon, SaveIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { InputNumberField } from "@/components/ui/input-number-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import type { VehicleRow } from "@/actions/types/vehicle";
import { maskPlate } from "@/lib/utils/masks";
import SectionLabel from "@/components/ui/section-label";

export default function VehicleEditForm({
  vehicle,
  afterSubmitAction,
}: {
  vehicle: VehicleRow;
  afterSubmitAction: () => void;
}) {
  const variant = "secondary";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateVehicleFormData>({
    resolver: zodResolver(updateVehicleSchema),
    defaultValues: {
      plate: maskPlate(vehicle.plate),
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year,
      color: vehicle.color ?? undefined,
      capacity: vehicle.capacity,
      observations: vehicle.observations ?? undefined,
    },
  });

  async function onSubmit(data: UpdateVehicleFormData) {
    await formSubmit({
      action: () => updateVehicle(vehicle.id, data),
      successMessage: "Veículo atualizado com sucesso",
      onSuccess: afterSubmitAction,
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 pb-2.5"
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Identificação</SectionLabel>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="plate"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="Placa"
                icon={TagIcon}
                error={errors.plate?.message}
                masks={[
                  {
                    mask: "AAA-0000",
                    replacement: { A: /[a-zA-Z]/, "0": /\d/ },
                  },
                  {
                    mask: "AAA-0A00",
                    replacement: { A: /[a-zA-Z]/, "0": /\d/ },
                  },
                ]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Modelo"
                icon={CarIcon}
                error={errors.model?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Marca"
                icon={CarIcon}
                error={errors.brand?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <InputNumberField
                label="Ano"
                error={errors.year?.message}
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Cor"
                icon={PaletteIcon}
                error={errors.color?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <InputNumberField
                label="Capacidade"
                error={errors.capacity?.message}
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="observations"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Observações"
              error={errors.observations?.message}
              autoComplete="off"
              variant={variant}
              {...field}
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
