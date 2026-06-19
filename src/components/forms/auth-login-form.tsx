"use client";

import { Form, toast } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, UserIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputPasswordField } from "@/components/ui/input-password-field";
import ButtonField from "@/components/ui/button-field";

export default function AuthLoginForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.danger("Usuário ou senha inválidos");
        return;
      }

      toast.success("Login realizado com sucesso");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.danger("Erro ao realizar login");
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <InputTextField
              variant="primary"
              label="Nome de usuário"
              placeholder="seu.usuario"
              icon={UserIcon}
              error={errors.username?.message}
              autoComplete="username"
              {...field}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <InputPasswordField
              variant="primary"
              label="Senha"
              placeholder="••••••••"
              error={errors.password?.message}
              autoComplete="current-password"
              {...field}
            />
          )}
        />

        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Entrar"
          icon={LogIn}
        />
      </Form>
    </>
  );
}
