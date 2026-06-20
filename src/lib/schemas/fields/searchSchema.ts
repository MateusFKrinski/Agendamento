import z from "zod";

export const searchSchema = z
  .string()
  .min(2, "Busca deve ter ao menos 2 caracteres")
  .max(100, "Busca deve ter no máximo 100 caracteres")
  .refine(
    (val) => /^[a-zA-ZÀ-ÿ0-9\s\-'.]+$/.test(val),
    "Busca contém caracteres inválidos",
  )
  .transform((val) => val.trim().replace(/\s+/g, " "));
