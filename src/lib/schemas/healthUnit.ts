import { z } from "zod";
import { cnpjSchema } from "./fields/cnpjSchema";
import { observationsSchema } from "./fields/observationsSchema";
import { phoneSchema } from "./fields/phoneSchema";
import { zipCodeSchema } from "./fields/zipCodeSchema";
import { streetSchema } from "./fields/streetSchema";
import { numberSchema } from "./fields/numberSchema";
import { complementSchema } from "./fields/complementSchema";
import { districtSchema } from "./fields/districtSchema";
import { citySchema } from "./fields/citySchema";
import { stateSchema } from "./fields/stateSchema";
import { genericNameSchema } from "@/lib/schemas/fields/genericNameSchema";

export const UNIT_TYPES = [
  "HOSPITAL",
  "UBS",
  "UPA",
  "CLINIC",
  "LABORATORY",
  "PHARMACY",
  "OTHER",
] as const;

export const UNIT_TYPE_LABELS: Record<string, string> = {
  HOSPITAL: "Hospital",
  UBS: "UBS",
  UPA: "UPA",
  CLINIC: "Clínica",
  LABORATORY: "Laboratório",
  PHARMACY: "Farmácia",
  OTHER: "Outro",
};

const healthUnitBaseSchema = z.object({
  unitName: genericNameSchema,
  unitType: z.enum(UNIT_TYPES, { message: "Tipo de unidade inválido" }),
  cnpj: cnpjSchema,
  phone: phoneSchema,
  email: z.email("E-mail inválido").optional().or(z.literal("")),
  observations: observationsSchema.optional().or(z.literal("")),
  address: z.object({
    zipCode: zipCodeSchema,
    street: streetSchema,
    number: numberSchema,
    complement: complementSchema.optional().or(z.literal("")),
    district: districtSchema,
    city: citySchema,
    state: stateSchema,
  }),
});

export const createHealthUnitSchema = healthUnitBaseSchema;
export const updateHealthUnitSchema = healthUnitBaseSchema;

export type CreateHealthUnitFormData = z.infer<typeof createHealthUnitSchema>;
export type UpdateHealthUnitFormData = z.infer<typeof updateHealthUnitSchema>;
