import { z } from "zod";
import { dateSchema } from "./fields/dateSchema";
import { timeSchema } from "./fields/timeSchema";
import { cancelReasonSchema } from "./fields/cancelReasonSchema";
import { observationsSchema } from "./fields/observationsSchema";

export const createTransportSchema = z.object({
  date: dateSchema,
  departureTime: timeSchema,
  vehicleId: z.uuid("Veículo obrigatório"),
  driverId: z.uuid("Motorista obrigatório"),
  observations: observationsSchema.optional().or(z.literal("")),
  appointmentIds: z.array(z.uuid("Agendamento obrigatório")),
});

export const addAppointmentsSchema = z.object({
  appointmentIds: z
    .array(z.uuid("Agendamento obrigatório"))
    .min(1, "Selecione ao menos um agendamento"),
});

export const updateTransportSchema = z.object({
  departureTime: timeSchema,
  driverId: z.uuid("Motorista obrigatório"),
  observations: observationsSchema.optional().or(z.literal("")),
});

export const cancelTransportSchema = z.object({
  cancelReason: cancelReasonSchema,
});

export type CreateTransportFormData = z.infer<typeof createTransportSchema>;
export type AddAppointmentsFormData = z.infer<typeof addAppointmentsSchema>;
export type UpdateTransportFormData = z.infer<typeof updateTransportSchema>;
