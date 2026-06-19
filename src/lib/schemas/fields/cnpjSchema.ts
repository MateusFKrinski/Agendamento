import { validateCNPJ } from "@/lib/utils/cnpj-validator";
import { z } from "zod";

export const cnpjSchema = z
  .string()
  .min(1, "CNPJ obrigatório")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 14, "CNPJ deve ter 14 dígitos")
  .refine((cnpj) => {
    return validateCNPJ(cnpj);
  }, "CNPJ inválido");
