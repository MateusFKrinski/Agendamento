import { z } from "zod";

export const genericNameSchema = z
  .string()
  .min(3, "Nome deve ter ao menos 3 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(
    /^[a-zA-ZÀ-ÿ\s]+$/,
    "Nome não pode conter números ou caracteres especiais",
  )
  .refine((val) => !/\s{2,}/.test(val), "Espaços duplos não são permitidos")
  .transform((val) => val.trim());
