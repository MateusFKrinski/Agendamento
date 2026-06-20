"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVehicleSchema,
  updateVehicleSchema,
  type CreateVehicleFormData,
  type UpdateVehicleFormData,
} from "@/lib/schemas/vehicle";
import { createVehicle, updateVehicle } from "@/actions/vehicle";
import type { VehicleRow } from "@/actions/types/vehicle";
import { Form } from "@heroui/react";
import { CarIcon, TagIcon, PaletteIcon, SaveIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { InputNumberField } from "@/components/ui/input-number-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { maskPlate } from "@/lib/utils/masks";
import SectionLabel from "@/components/ui/section-label";

type FormData = CreateVehicleFormData | UpdateVehicleFormData;

const PLATE_MASKS = [
  { mask: "AAA-0000", replacement: { A: /[a-zA-Z]/, "0": /\d/ } },
  { mask: "AAA-0A00", replacement: { A: /[a-zA-Z]/, "0": /\d/ } },
];

interface VehicleFormProps {
  vehicle?: VehicleRow;
  afterSubmitAction?: () => void;
}

export default function VehicleForm({
  vehicle,
  afterSubmitAction,
}: VehicleFormProps) {
  const isEditing = !!vehicle;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? updateVehicleSchema : createVehicleSchema,
    ),
    defaultValues: isEditing
      ? {
          plate: maskPlate(vehicle.plate),
          model: vehicle.model,
          brand: vehicle.brand,
          year: vehicle.year,
          color: vehicle.color ?? undefined,
          capacity: vehicle.capacity,
          observations: vehicle.observations ?? undefined,
        }
      : {
          plate: "",
          model: "",
          brand: "",
          year: undefined,
          color: "",
          capacity: undefined,
          observations: undefined,
        },
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateVehicle(vehicle.id, data as UpdateVehicleFormData)
          : createVehicle(data as CreateVehicleFormData),
      successMessage: isEditing
        ? "Veículo atualizado com sucesso"
        : "Veículo cadastrado com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 ${isEditing ? "pb-2.5" : "pb-10"}`}
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
                placeholder={isEditing ? undefined : "ABC-1D23"}
                icon={TagIcon}
                error={errors.plate?.message}
                masks={PLATE_MASKS}
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
                placeholder={isEditing ? undefined : "Sprinter"}
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
                placeholder={isEditing ? undefined : "Mercedes-Benz"}
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
                placeholder={isEditing ? undefined : "Branco"}
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
              placeholder={isEditing ? undefined : "Observações relevantes..."}
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
        label={isEditing ? "Salvar alterações" : "Cadastrar veículo"}
        icon={SaveIcon}
      />
    </Form>
  );
}
