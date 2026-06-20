import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Usuário deve ter ao menos 3 caracteres")
  .max(32, "Usuário deve ter no máximo 32 caracteres")
  .toLowerCase()
  .regex(
    /^[a-z0-9._-]+$/,
    "Apenas letras minúsculas, números, pontos, hífens e underscores",
  )
  .refine(
    (val) => !val.startsWith(".") && !val.endsWith("."),
    "Não pode começar ou terminar com ponto",
  )
  .refine(
    (val) => !/\.{2,}/.test(val),
    "Pontos consecutivos não são permitidos",
  );
