import { z } from "zod";
import { nameSchema } from "./fields/nameSchema";
import { cpfSchema } from "./fields/cpfSchema";
import { phoneSchema } from "./fields/phoneSchema";
import { birthDateSchema } from "./fields/birthDateSchema";
import { observationsSchema } from "./fields/observationsSchema";
import { address } from "./address";

export const createPersonSchema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
  birthDate: birthDateSchema,
  phone: phoneSchema,
  observations: observationsSchema.optional().or(z.literal("")),
  address: address,
});

export const updatePersonSchema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
  birthDate: birthDateSchema,
  phone: phoneSchema,
  observations: observationsSchema.optional().or(z.literal("")),
  address: address,
});

export type UpdatePersonFormData = z.infer<typeof updatePersonSchema>;
export type CreatePersonFormData = z.infer<typeof createPersonSchema>;
