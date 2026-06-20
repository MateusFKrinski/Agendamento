import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

export const vehicleYearSchema = z
  .number({ message: "Ano obrigatório" })
  .int("Ano inválido")
  .min(1950, "Ano inválido")
  .max(CURRENT_YEAR + 1, "Ano inválido");
