import { z } from "zod";

export const vehicleColorSchema = z
  .string()
  .max(30, "Cor deve ter no máximo 30 caracteres")
  .regex(/^[\p{L}\s-]*$/u, "Cor inválida")
  .transform((val) => val.trim());
