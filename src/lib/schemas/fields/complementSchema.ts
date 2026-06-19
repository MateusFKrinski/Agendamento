import { z } from "zod";

export const complementSchema = z
  .string()
  .max(50, "Complemento deve ter no máximo 50 caracteres")
  .refine(
    (val) => !val || /^[\p{L}\p{N}\s.,;:!?()\-'"\/\n]+$/u.test(val),
    "Caracteres inválidos",
  )
  .refine((val) => !val || val.trim().length >= 2, "Complemento muito curto")
  .transform((val) => val.trim());
