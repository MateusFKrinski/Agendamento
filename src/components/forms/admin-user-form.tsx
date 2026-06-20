"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/lib/schemas/user";
import { createUser, updateUser } from "@/actions/user";
import { Form, Label, Switch } from "@heroui/react";
import { UserIcon, AtSignIcon, SaveIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputPasswordField } from "@/components/ui/input-password-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { Prisma } from "@/generated/prisma";

type UserRow = Prisma.UserGetPayload<{
  omit: {
    createdAt: true;
    hashPassword: true;
    lastPasswordChangedAt: true;
    updatedAt: true;
  };
}>;

type FormData = CreateUserFormData | UpdateUserFormData;

interface AdminUserFormProps {
  user?: UserRow;
  afterSubmitAction?: () => void;
}

export default function AdminUserForm({
  user,
  afterSubmitAction,
}: AdminUserFormProps) {
  const isEditing = !!user;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing
      ? { name: user.name, username: user.username, isAdmin: user.isAdmin }
      : { name: "", username: "", password: "", isAdmin: false },
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateUser(user.id, data as UpdateUserFormData)
          : createUser(data as CreateUserFormData),
      successMessage: isEditing
        ? "Usuário atualizado com sucesso"
        : "Usuário criado com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-4 ${isEditing ? "py-2" : ""}`}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Nome completo"
            placeholder={isEditing ? undefined : "Fulano de Tal"}
            icon={UserIcon}
            error={errors.name?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Nome de usuário"
            placeholder={isEditing ? undefined : "nome.usuario"}
            icon={AtSignIcon}
            error={errors.username?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />

      {!isEditing && (
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <InputPasswordField
              variant={variant}
              label="Senha provisória"
              placeholder="••••••••"
              error={
                (errors as { password?: { message?: string } }).password
                  ?.message
              }
              autoComplete="new-password"
              {...field}
            />
          )}
        />
      )}

      <div
        className={`flex items-center justify-between gap-4 ${!isEditing ? "mt-2" : ""}`}
      >
        <Controller
          name="isAdmin"
          control={control}
          render={({ field }) => (
            <Switch isSelected={field.value} onChange={field.onChange}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                <Label>Administrador</Label>
              </Switch.Content>
            </Switch>
          )}
        />

        <ButtonField
          {...{ type: "submit" }}
          isSubmitting={isSubmitting}
          label={isEditing ? "Salvar" : "Criar usuário"}
          icon={SaveIcon}
        />
      </div>
    </Form>
  );
}
