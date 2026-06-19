import { validateCNPJ } from "@/lib/utils/cnpj-validator";
import { validateCPF } from "@/lib/utils/cpf-validator";
import { z } from "zod";

export const PIX_KEY_TYPES = [
  "CPF",
  "CNPJ",
  "EMAIL",
  "PHONE",
  "RANDOM",
] as const;

const bankAccountSchema = z
  .string()
  .min(1, "Conta obrigatória")
  .regex(/^[\d-]+$/, "Conta inválida")
  .max(20, "Conta deve ter no máximo 20 caracteres");

const bankAgencySchema = z
  .string()
  .min(1, "Agência obrigatória")
  .regex(/^[\d-]+$/, "Agência inválida")
  .max(10, "Agência deve ter no máximo 10 caracteres");

export const paymentMethodSchema = z
  .object({
    label: z
      .string()
      .min(2, "Identificação deve ter ao menos 2 caracteres")
      .max(50, "Identificação deve ter no máximo 50 caracteres"),

    bankName: z.string().min(1, "Banco obrigatório").max(100),
    bankAgency: bankAgencySchema,
    bankAccount: bankAccountSchema,

    pixKeyType: z.enum(PIX_KEY_TYPES, {
      message: "Selecione o tipo da chave PIX",
    }),
    pixKey: z
      .string()
      .min(1, "Chave PIX obrigatória")
      .max(140, "Chave PIX inválida"),
  })
  .refine(
    (data) => {
      if (data.pixKeyType !== "CPF") return true;
      return validateCPF(data.pixKey);
    },
    { message: "Chave PIX do tipo CPF inválida", path: ["pixKey"] },
  )
  .refine(
    (data) => {
      if (data.pixKeyType !== "CNPJ") return true;
      return validateCNPJ(data.pixKey);
    },
    { message: "Chave PIX do tipo CNPJ inválida", path: ["pixKey"] },
  )
  .refine(
    (data) => {
      if (data.pixKeyType !== "PHONE") return true;
      const digits = data.pixKey.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    },
    { message: "Chave PIX do tipo telefone inválida", path: ["pixKey"] },
  )
  .refine(
    (data) => {
      if (data.pixKeyType !== "EMAIL") return true;
      return z.email().safeParse(data.pixKey).success;
    },
    { message: "Chave PIX do tipo e-mail inválida", path: ["pixKey"] },
  );

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
