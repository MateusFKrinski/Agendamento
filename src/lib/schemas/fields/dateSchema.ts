import z from "zod";

export const dateSchema = z
  .string()
  .min(1, "Data obrigatória")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Data inválida");
