import { z } from "zod";

export const nameSchema = z
  .string()
  .min(3, "Nome deve ter ao menos 3 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(
    /^[a-zA-ZÀ-ÿ\s]+$/,
    "Nome não pode conter números ou caracteres especiais",
  )
  .refine((val) => val.trim().includes(" "), "Informe o nome completo")
  .refine((val) => !/\s{2,}/.test(val), "Espaços duplos não são permitidos")
  .transform((val) =>
    val
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  );
