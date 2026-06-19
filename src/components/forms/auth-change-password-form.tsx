import { Form, Description } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { InputPasswordField } from "@/components/ui/input-password-field";
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordAction } from "@/actions/auth";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";
import { SaveIcon } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AuthChangePasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(data: ChangePasswordFormData) {
    await formSubmit({
      action: () => changePasswordAction(data),
      successMessage: "Senha alterada com sucesso",
      onSuccess: async () => {
        await signOut({ callbackUrl: "/auth/login" });
      },
    });
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <InputPasswordField
              variant="primary"
              label="Nova senha"
              placeholder="••••••••"
              error={errors.password?.message}
              {...field}
            />
          )}
        />

        <Description className="text-xs text-muted -mt-2">
          Mínimo 8 caracteres, com maiúscula, número e caractere especial
        </Description>

        <Controller
          name="confirm"
          control={control}
          render={({ field }) => (
            <InputPasswordField
              variant="primary"
              label="Confirmar senha"
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...field}
            />
          )}
        />

        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Salvar nova senha"
          icon={SaveIcon}
        />
      </Form>
    </>
  );
}
