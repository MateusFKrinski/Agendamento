import { z } from "zod";

export const streetSchema = z
  .string()
  .min(3, "Rua deve ter ao menos 3 caracteres")
  .max(100, "Rua deve ter no máximo 100 caracteres")
  .regex(/^[\p{L}\p{N}\s.,'-]+$/u, "Caracteres inválidos")
  .refine((val) => !/\s{2,}/.test(val), "Espaços duplos não são permitidos")
  .transform((val) => val.trim());
