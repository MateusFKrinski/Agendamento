import { z } from "zod";

export const vehicleModelSchema = z
  .string()
  .min(1, "Modelo obrigatório")
  .max(50, "Modelo deve ter no máximo 50 caracteres")
  .transform((val) => val.trim());
