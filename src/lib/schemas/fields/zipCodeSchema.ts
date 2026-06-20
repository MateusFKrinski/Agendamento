import { z } from "zod";

export const zipCodeSchema = z
  .string()
  .min(1, "CEP obrigatório")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 8, "CEP deve ter 8 dígitos");
