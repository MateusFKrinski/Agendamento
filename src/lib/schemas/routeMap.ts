import { z } from "zod";

export const generateRouteMapSchema = z.object({
  transportId: z.uuid("Transporte obrigatório"),
});

export type GenerateRouteMapFormData = z.infer<typeof generateRouteMapSchema>;
