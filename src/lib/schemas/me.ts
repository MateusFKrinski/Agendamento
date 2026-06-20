import z from "zod";
import { nameSchema } from "@/lib/schemas/fields/nameSchema";
import { usernameSchema } from "@/lib/schemas/fields/usernameSchema";
import { passwordSchema } from "@/lib/schemas/fields/passwordSchema";

export const updateMeSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
});

export const changeMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual obrigatória"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type UpdateMeFormData = z.infer<typeof updateMeSchema>;
export type ChangeMyPasswordFormData = z.infer<typeof changeMyPasswordSchema>;
