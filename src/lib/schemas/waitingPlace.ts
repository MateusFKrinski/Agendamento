import { z } from "zod";
import { genericNameSchema } from "@/lib/schemas/fields/genericNameSchema";

export const createWaitingPlaceSchema = z.object({
  name: genericNameSchema,
});

export const updateWaitingPlaceSchema = createWaitingPlaceSchema;

export type CreateWaitingPlaceFormData = z.infer<
  typeof createWaitingPlaceSchema
>;
export type UpdateWaitingPlaceFormData = z.infer<
  typeof updateWaitingPlaceSchema
>;
