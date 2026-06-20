import z from "zod";

export const moneySchema = z
  .string()
  .min(1, "Valor obrigatório")
  .refine(
    (val) => /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(val),
    "Valor inválido",
  );
