"use client";

import { Avatar, Card, Chip, Separator } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@heroui/react";
import { AtSignIcon, KeyRoundIcon, SaveIcon, UserIcon } from "lucide-react";
import { getMe, updateMe, changeMyPassword } from "@/actions/me";
import { useFetch } from "@/lib/hooks/use-fetch";
import { AsyncState } from "@/components/ui/async-state";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputPasswordField } from "@/components/ui/input-password-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import splitInitials from "@/lib/utils/split-initials";
import {
  updateMeSchema,
  changeMyPasswordSchema,
  type UpdateMeFormData,
  type ChangeMyPasswordFormData,
} from "@/lib/schemas/me";
import SectionLabel from "@/components/ui/section-label";

export default function Page() {
  const { data, loading, error, refresh } = useFetch(getMe);
  const user = data?.success ? data.data.user : null;

  const infoForm = useForm<UpdateMeFormData>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: { name: "", username: "" },
    values: user ? { name: user.name, username: user.username } : undefined,
  });

  const passwordForm = useForm<ChangeMyPasswordFormData>({
    resolver: zodResolver(changeMyPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmitInfo(data: UpdateMeFormData) {
    await formSubmit({
      action: () => updateMe(data),
      successMessage: "Dados atualizados com sucesso",
      onSuccess: refresh,
    });
  }

  async function onSubmitPassword(data: ChangeMyPasswordFormData) {
    await formSubmit({
      action: () => changeMyPassword(data),
      successMessage: "Senha alterada com sucesso",
      onSuccess: () => passwordForm.reset(),
    });
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Minha conta</h1>
        <p className="text-sm text-muted">Gerencie suas informações pessoais</p>
      </div>

      <AsyncState
        data={user}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
      >
        {(user) => (
          <div className="flex flex-col gap-4">
            <Card className="w-full">
              <Card.Header>
                <div className="flex items-center gap-4 px-2">
                  <Avatar size="lg" color="accent">
                    <Avatar.Fallback>
                      {splitInitials(user.name)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Card.Title>{user.name}</Card.Title>
                      {user.isAdmin && (
                        <Chip size="sm" color="accent">
                          Admin
                        </Chip>
                      )}
                    </div>
                    <Card.Description>@{user.username}</Card.Description>
                    <p className="text-xs text-muted">
                      Membro desde{" "}
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Card.Header>
            </Card>

            <Card className="w-full">
              <Card.Header>
                <div className="px-2">
                  <SectionLabel>Dados pessoais</SectionLabel>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="px-2 pb-2">
                  <Form
                    onSubmit={infoForm.handleSubmit(onSubmitInfo)}
                    className="flex flex-col gap-3"
                  >
                    <Controller
                      name="name"
                      control={infoForm.control}
                      render={({ field }) => (
                        <InputTextField
                          label="Nome completo"
                          icon={UserIcon}
                          error={infoForm.formState.errors.name?.message}
                          autoComplete="off"
                          variant="secondary"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="username"
                      control={infoForm.control}
                      render={({ field }) => (
                        <InputTextField
                          label="Nome de usuário"
                          icon={AtSignIcon}
                          error={infoForm.formState.errors.username?.message}
                          autoComplete="off"
                          variant="secondary"
                          {...field}
                        />
                      )}
                    />
                    <ButtonField
                      {...{ type: "submit", className: "w-full" }}
                      isSubmitting={infoForm.formState.isSubmitting}
                      label="Salvar alterações"
                      icon={SaveIcon}
                    />
                  </Form>
                </div>
              </Card.Content>
            </Card>

            <Card className="w-full">
              <Card.Header>
                <div className="px-2">
                  <SectionLabel>Alterar senha</SectionLabel>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="px-2 pb-2">
                  <Form
                    onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                    className="flex flex-col gap-3"
                  >
                    <InputPasswordField
                      label="Senha atual"
                      error={
                        passwordForm.formState.errors.currentPassword?.message
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      variant="secondary"
                      {...passwordForm.register("currentPassword")}
                    />

                    <Separator />

                    <InputPasswordField
                      label="Nova senha"
                      error={passwordForm.formState.errors.newPassword?.message}
                      autoComplete="new-password"
                      variant="secondary"
                      placeholder="••••••••"
                      {...passwordForm.register("newPassword")}
                    />
                    <InputPasswordField
                      label="Confirmar nova senha"
                      error={
                        passwordForm.formState.errors.confirmPassword?.message
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      variant="secondary"
                      {...passwordForm.register("confirmPassword")}
                    />
                    <ButtonField
                      {...{ type: "submit", className: "w-full" }}
                      isSubmitting={passwordForm.formState.isSubmitting}
                      label="Alterar senha"
                      icon={KeyRoundIcon}
                    />
                  </Form>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
