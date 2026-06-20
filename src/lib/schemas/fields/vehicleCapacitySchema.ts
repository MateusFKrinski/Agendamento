import { z } from "zod";

export const vehicleCapacitySchema = z
  .number({ message: "Capacidade obrigatória" })
  .int("Capacidade inválida")
  .min(1, "Capacidade deve ser de ao menos 1 passageiro")
  .max(100, "Capacidade inválida");
