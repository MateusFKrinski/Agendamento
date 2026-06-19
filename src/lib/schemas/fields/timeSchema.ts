import { z } from "zod";

export const timeSchema = z
  .string()
  .trim()
  .min(1, "Horário obrigatório")
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inválido");
