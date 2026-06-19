import { z } from "zod";
import { streetSchema } from "./fields/streetSchema";
import { numberSchema } from "./fields/numberSchema";
import { complementSchema } from "./fields/complementSchema";
import { districtSchema } from "./fields/districtSchema";
import { citySchema } from "./fields/citySchema";
import { stateSchema } from "./fields/stateSchema";
import { zipCodeSchema } from "./fields/zipCodeSchema";

export const address = z.object({
  zipCode: zipCodeSchema,
  street: streetSchema,
  number: numberSchema,
  complement: complementSchema.optional().or(z.literal("")),
  district: districtSchema,
  city: citySchema,
  state: stateSchema,
});
