import { z } from "zod";

export const rgSchema = z
  .string()
  .min(5, "RG inválido")
  .max(20, "RG deve ter no máximo 20 caracteres")
  .regex(/^[\d.\-\/]+$/, "RG inválido");
