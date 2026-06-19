import { z } from "zod";
import { nameSchema } from "./fields/nameSchema";
import { cpfSchema } from "./fields/cpfSchema";
import { phoneSchema } from "./fields/phoneSchema";
import { birthDateSchema } from "./fields/birthDateSchema";
import { observationsSchema } from "./fields/observationsSchema";
import { cnhNumberSchema } from "./fields/cnhNumberSchema";
import { cnhCategorySchema } from "./fields/cnhCategorySchema";
import { cnhExpirationSchema } from "./fields/cnhExpirationSchema";
import { paymentMethodSchema } from "./fields/paymentMethodSchema";
import { rgSchema } from "@/lib/schemas/fields/rgSchema";
import { roleSchema } from "@/lib/schemas/fields/roleSchema";

export const driverBaseSchema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
  rg: rgSchema,
  role: roleSchema,
  birthDate: birthDateSchema,
  phone: phoneSchema,
  observations: observationsSchema.optional().or(z.literal("")),
  cnhNumber: cnhNumberSchema,
  cnhCategory: cnhCategorySchema,
  cnhExpiration: cnhExpirationSchema,
});

export const createDriverSchema = driverBaseSchema.extend({
  paymentMethods: z
    .array(paymentMethodSchema)
    .min(1, "Adicione ao menos um método de pagamento"),
});

export const updateDriverSchema = driverBaseSchema;

export type CreateDriverFormData = z.infer<typeof createDriverSchema>;
export type UpdateDriverFormData = z.infer<typeof updateDriverSchema>;

export type DriverBaseFormData = z.infer<typeof driverBaseSchema>;
