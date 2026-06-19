import { z } from "zod";

export const vehicleBrandSchema = z
  .string()
  .min(1, "Marca obrigatória")
  .max(50, "Marca deve ter no máximo 50 caracteres")
  .transform((val) => val.trim());
