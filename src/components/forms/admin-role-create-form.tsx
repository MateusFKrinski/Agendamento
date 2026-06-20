"use client";

import { Form } from "@heroui/react";
import { PlusIcon, UserRoundKey } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoleSchema, type CreateRoleFormData } from "@/lib/schemas/role";
import { createRole } from "@/actions/role";
import { InputTextField } from "@/components/ui/input-text-field";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";

export default function AdminRoleCreateForm({
  afterSubmitAction,
}: {
  afterSubmitAction: () => void;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateRoleFormData) {
    await formSubmit({
      action: () => createRole(data),
      successMessage: "Permissão criada com sucesso",
      onSuccess: () => {
        reset();
        afterSubmitAction();
      },
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex items-end justify-center gap-3"
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputTextField
            variant="primary"
            label="Nome da permissão"
            placeholder="Ex: Recepcionista"
            icon={UserRoundKey}
            error={errors.name?.message}
            autoComplete="off"
            {...field}
          />
        )}
      />

      <ButtonField
        {...{ type: "submit" }}
        isSubmitting={isSubmitting}
        label="Criar permissão"
        icon={PlusIcon}
      />
    </Form>
  );
}
