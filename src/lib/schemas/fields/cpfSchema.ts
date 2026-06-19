import { validateCPF } from "@/lib/utils/cpf-validator";
import { z } from "zod";

export const cpfSchema = z
  .string()
  .min(1, "CPF obrigatório")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 11, "CPF deve ter 11 dígitos")
  .refine((cpf) => {
    return validateCPF(cpf);
  }, "CPF inválido");
