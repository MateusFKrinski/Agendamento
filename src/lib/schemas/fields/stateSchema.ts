import { z } from "zod";

const VALID_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export const stateSchema = z
  .string()
  .length(2, "UF deve ter 2 letras")
  .regex(/^[a-zA-Z]+$/, "UF deve conter apenas letras")
  .transform((val) => val.toUpperCase())
  .refine((val) => VALID_STATES.includes(val), "UF inválida");
