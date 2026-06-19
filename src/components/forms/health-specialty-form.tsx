"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createHealthSpecialtySchema,
  updateHealthSpecialtySchema,
  type CreateHealthSpecialtyFormData,
  type UpdateHealthSpecialtyFormData,
} from "@/lib/schemas/healthSpecialty";
import {
  createHealthSpecialty,
  updateHealthSpecialty,
} from "@/actions/healthSpecialty";
import type { HealthSpecialtyRow } from "@/actions/types/healthSpecialty";
import { Form } from "@heroui/react";
import { StethoscopeIcon, SaveIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";

type FormData = CreateHealthSpecialtyFormData | UpdateHealthSpecialtyFormData;

interface HealthSpecialtyFormProps {
  specialty?: HealthSpecialtyRow;
  afterSubmitAction?: () => void;
}

export default function HealthSpecialtyForm({
  specialty,
  afterSubmitAction,
}: HealthSpecialtyFormProps) {
  const isEditing = !!specialty;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? updateHealthSpecialtySchema : createHealthSpecialtySchema,
    ),
    defaultValues: isEditing
      ? {
          name: specialty.name,
          observations: specialty.observations ?? undefined,
        }
      : { name: "", observations: undefined },
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateHealthSpecialty(
              specialty.id,
              data as UpdateHealthSpecialtyFormData,
            )
          : createHealthSpecialty(data as CreateHealthSpecialtyFormData),
      successMessage: isEditing
        ? "Especialidade atualizada com sucesso"
        : "Especialidade cadastrada com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-4 ${isEditing ? "pb-2.5" : "pb-10"}`}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Nome"
            placeholder={isEditing ? undefined : "Ex: Cardiologia"}
            icon={StethoscopeIcon}
            error={errors.name?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />

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

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label={isEditing ? "Salvar alterações" : "Cadastrar especialidade"}
        icon={SaveIcon}
      />
    </Form>
  );
}
