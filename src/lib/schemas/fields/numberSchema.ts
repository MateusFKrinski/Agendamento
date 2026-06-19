import { z } from "zod";

export const numberSchema = z
  .string()
  .min(1, "Número obrigatório")
  .max(10, "Número deve ter no máximo 10 caracteres")
  .regex(/^[\p{L}\p{N}\s\/-]+$/u, "Número inválido")
  .transform((val) => val.trim().toUpperCase());
