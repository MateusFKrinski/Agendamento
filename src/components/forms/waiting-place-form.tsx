"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWaitingPlaceSchema,
  updateWaitingPlaceSchema,
  type CreateWaitingPlaceFormData,
  type UpdateWaitingPlaceFormData,
} from "@/lib/schemas/waitingPlace";
import { createWaitingPlace, updateWaitingPlace } from "@/actions/waitingPlace";
import { WaitingPlaceRow } from "@/actions/types/waitingPlace";
import { Form } from "@heroui/react";
import { MapPinIcon, SaveIcon, PlusIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";

type FormData = CreateWaitingPlaceFormData | UpdateWaitingPlaceFormData;

interface WaitingPlaceFormProps {
  waitingPlace?: WaitingPlaceRow;
  afterSubmitAction?: () => void;
  inline?: boolean;
}

export default function WaitingPlaceForm({
  waitingPlace,
  afterSubmitAction,
  inline = false,
}: WaitingPlaceFormProps) {
  const isEditing = !!waitingPlace;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? updateWaitingPlaceSchema : createWaitingPlaceSchema,
    ),
    defaultValues: { name: waitingPlace?.name ?? "" },
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateWaitingPlace(
              waitingPlace.id,
              data as UpdateWaitingPlaceFormData,
            )
          : createWaitingPlace(data as CreateWaitingPlaceFormData),
      successMessage: isEditing
        ? "Local de espera atualizado com sucesso"
        : "Local de espera cadastrado com sucesso",
      onSuccess: isEditing
        ? afterSubmitAction
        : () => {
            reset();
            afterSubmitAction?.();
          },
    });
  }

  if (inline) {
    return (
      <Form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
        <div className="flex-1">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Novo local de espera"
                placeholder="Ex: Posto de Saúde Central"
                icon={MapPinIcon}
                error={errors.name?.message}
                variant={variant}
                autoComplete="off"
                {...field}
              />
            )}
          />
        </div>
        <ButtonField
          {...{ type: "submit" }}
          isSubmitting={isSubmitting}
          label="Cadastrar"
          icon={PlusIcon}
        />
      </Form>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-2.5"
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Nome"
            icon={MapPinIcon}
            error={errors.name?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />
      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Salvar alterações"
        icon={SaveIcon}
      />
    </Form>
  );
}
