import { z } from "zod";
import { usernameSchema } from "@/lib/schemas/fields/usernameSchema";
import { passwordSchema } from "@/lib/schemas/fields/passwordSchema";

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
