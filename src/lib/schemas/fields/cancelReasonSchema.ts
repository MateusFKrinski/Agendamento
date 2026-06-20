import { z } from "zod";

export const cancelReasonSchema = z
  .string()
  .max(500, "Complemento deve ter no máximo 50 caracteres")
  .regex(/^[\p{L}\p{N}\s.,'-]+$/u, "Caracteres inválidos")
  .refine((val) => !val || val.trim().length >= 5, "Complemento muito curto")
  .transform((val) => val.trim());
