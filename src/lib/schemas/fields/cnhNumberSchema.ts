import { z } from "zod";

export const cnhNumberSchema = z
  .string()
  .min(1, "Número da CNH obrigatório")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 11, "CNH deve ter 11 dígitos");
