import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .max(128, "Máximo de 128 caracteres")
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^a-zA-Z0-9]/, "Deve conter ao menos um caractere especial")
  .refine((val) => !/[<>&"'`\/\\]/.test(val), "Caracteres inválidos na senha")
  .refine(
    (val) => !/(.)\1{2,}/.test(val),
    "Não pode conter caracteres repetidos em sequência",
  );
