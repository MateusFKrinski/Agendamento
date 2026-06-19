import { z } from "zod";

export const descriptionSchema = z
  .string()
  .max(500, "Máximo de 500 caracteres")
  .refine(
    (val) => !val || /^[\p{L}\p{N}\s.,;:!?()\-'"\/\n]+$/u.test(val),
    "Caracteres inválidos",
  )
  .refine(
    (val) => !val || !/(.)\1{4,}/.test(val),
    "Não pode conter caracteres repetidos em excesso",
  )
  .refine((val) => !val || val.trim().length >= 3, "Descrição muito curta");
