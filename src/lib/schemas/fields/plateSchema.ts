import { z } from "zod";

export const plateSchema = z
  .string()
  .min(1, "Placa obrigatória")
  .refine((val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return (
      /^[A-Z]{3}\d{4}$/.test(clean) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(clean)
    );
  }, "Placa inválida")
  .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""));
