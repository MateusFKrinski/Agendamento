import { z } from "zod";

export const districtSchema = z
  .string()
  .min(2, "Bairro deve ter ao menos 2 caracteres")
  .max(100, "Bairro deve ter no máximo 100 caracteres")
  .regex(/^[\p{L}\p{N}\s.,'-]+$/u, "Caracteres inválidos")
  .refine((val) => !/\s{2,}/.test(val), "Espaços duplos não são permitidos")
  .transform((val) => val.trim());
