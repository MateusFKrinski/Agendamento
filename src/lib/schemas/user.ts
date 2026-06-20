import { z } from "zod";
import { nameSchema } from "@/lib/schemas/fields/nameSchema";
import { usernameSchema } from "@/lib/schemas/fields/usernameSchema";
import { passwordSchema } from "@/lib/schemas/fields/passwordSchema";

export const createUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  password: passwordSchema,
  isAdmin: z.boolean(),
});

export const updateUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  isAdmin: z.boolean(),
});

export const resetUserPasswordSchema = z.object({
  password: passwordSchema,
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordFormData = z.infer<typeof resetUserPasswordSchema>;
