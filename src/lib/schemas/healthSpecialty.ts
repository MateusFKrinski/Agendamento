import { z } from "zod";
import { observationsSchema } from "./fields/observationsSchema";
import { genericNameSchema } from "./fields/genericNameSchema";

export const createHealthSpecialtySchema = z.object({
  name: genericNameSchema,
  observations: observationsSchema.optional().or(z.literal("")),
});

export const updateHealthSpecialtySchema = createHealthSpecialtySchema;

export type CreateHealthSpecialtyFormData = z.infer<
  typeof createHealthSpecialtySchema
>;
export type UpdateHealthSpecialtyFormData = z.infer<
  typeof updateHealthSpecialtySchema
>;
