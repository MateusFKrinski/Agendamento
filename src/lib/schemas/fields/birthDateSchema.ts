import { z } from "zod";

export const birthDateSchema = z
  .string()
  .min(1, "Data de nascimento obrigatória")
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Data inválida")
  .refine((val) => {
    const date = new Date(val);
    return date <= new Date();
  }, "Data de nascimento não pode ser no futuro")
  .refine((val) => {
    const date = new Date(val);
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - 150);
    return date >= limit;
  }, "Data de nascimento inválida")
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > date.getMonth() ||
      (today.getMonth() === date.getMonth() &&
        today.getDate() >= date.getDate());
    const realAge = hasBirthdayPassed ? age : age - 1;
    return realAge >= 0;
  }, "Data de nascimento inválida");
