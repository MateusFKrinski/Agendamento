import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(1, "Telefone obrigatório")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length >= 10 && val.length <= 11, "Telefone inválido");
