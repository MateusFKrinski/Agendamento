import { z } from "zod";
import { genericNameSchema } from "@/lib/schemas/fields/genericNameSchema";

export const createRoleSchema = z.object({
  name: genericNameSchema,
});

export const updateRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()),
});

export const assignRoleSchema = z.object({
  roleId: z.string().min(1, "Selecione uma permissão"),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
