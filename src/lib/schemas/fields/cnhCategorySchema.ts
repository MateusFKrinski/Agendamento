import { z } from "zod";

export const CNH_CATEGORIES = ["A", "B", "AB", "C", "D", "E"] as const;

export const cnhCategorySchema = z.enum(CNH_CATEGORIES, {
  message: "Categoria de CNH inválida",
});
