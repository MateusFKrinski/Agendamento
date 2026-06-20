import { z } from "zod";

export const citySchema = z
  .string()
  .min(2, "Cidade deve ter ao menos 2 caracteres")
  .max(100, "Cidade deve ter no máximo 100 caracteres")
  .regex(/^[\p{L}\s'-]+$/u, "Nome de cidade inválido")
  .refine((val) => !/\s{2,}/.test(val), "Espaços duplos não são permitidos")
  .transform((val) =>
    val
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" "),
  );
