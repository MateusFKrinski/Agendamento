import { z } from "zod";
import { plateSchema } from "./fields/plateSchema";
import { vehicleModelSchema } from "./fields/vehicleModelSchema";
import { vehicleBrandSchema } from "./fields/vehicleBrandSchema";
import { vehicleYearSchema } from "./fields/vehicleYearSchema";
import { vehicleColorSchema } from "./fields/vehicleColorSchema";
import { vehicleCapacitySchema } from "./fields/vehicleCapacitySchema";
import { observationsSchema } from "./fields/observationsSchema";

export const createVehicleSchema = z.object({
  plate: plateSchema,
  model: vehicleModelSchema,
  brand: vehicleBrandSchema,
  year: vehicleYearSchema,
  color: vehicleColorSchema.optional().or(z.literal("")),
  capacity: vehicleCapacitySchema,
  observations: observationsSchema.optional().or(z.literal("")),
});

export const updateVehicleSchema = createVehicleSchema;

export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;
