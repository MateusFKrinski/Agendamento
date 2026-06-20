import { z } from "zod";

export const roleSchema = z
  .string()
  .min(2, "Cargo deve ter ao menos 2 caracteres")
  .max(60, "Cargo deve ter no máximo 60 caracteres")
  .regex(/^[\p{L}\s.\-']+$/u, "Cargo contém caracteres inválidos");
