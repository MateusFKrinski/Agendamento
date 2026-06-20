import { z } from "zod";

export const dailyTextSchema = z
  .string()
  .max(50, "Texto deve ter no máximo 50 caracteres")
  .regex(/^[\p{L}\p{N}\s.,'\-\/]+$/u, "Caracteres inválidos")
  .refine((val) => !val || val.trim().length >= 2, "Texto muito curto")
  .transform((val) => val.trim());
