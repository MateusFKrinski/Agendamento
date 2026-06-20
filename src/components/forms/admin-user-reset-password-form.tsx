import { resetUserPassword } from "@/actions/user";
import { Form } from "@heroui/react";
import { useForm } from "react-hook-form";
import {
  ResetUserPasswordFormData,
  resetUserPasswordSchema,
} from "@/lib/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputPasswordField } from "@/components/ui/input-password-field";
import { KeyRoundIcon } from "lucide-react";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";

export default function AdminUserResetPasswordForm({
  userId,
  afterSubmitAction,
}: {
  userId: string;
  afterSubmitAction: () => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetUserPasswordFormData>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(data: ResetUserPasswordFormData) {
    await formSubmit({
      action: () => resetUserPassword(userId, data),
      successMessage: "Senha redefinida com sucesso",
      onSuccess: () => afterSubmitAction(),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 py-2"
    >
      <InputPasswordField
        label="Nova senha provisória"
        placeholder="••••••••"
        error={errors.password?.message}
        autoComplete="new-password"
        variant="secondary"
        {...control.register("password")}
      />

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Redefinir senha"
        icon={KeyRoundIcon}
      />
    </Form>
  );
}
