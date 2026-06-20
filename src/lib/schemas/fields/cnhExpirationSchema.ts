import { z } from "zod";

export const cnhExpirationSchema = z
  .string()
  .min(1, "Validade da CNH obrigatória")
  .refine((val) => !isNaN(new Date(val).getTime()), "Data inválida");
