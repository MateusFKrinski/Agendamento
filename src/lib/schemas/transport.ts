import { z } from "zod";
import { dateSchema } from "./fields/dateSchema";
import { timeSchema } from "./fields/timeSchema";
import { cancelReasonSchema } from "./fields/cancelReasonSchema";

export const createTransportSchema = z.object({
  date: dateSchema,
  departureTime: timeSchema,
  vehicleId: z.uuid("Veículo obrigatório"),
  driverId: z.uuid("Motorista obrigatório"),
  appointmentIds: z
    .array(z.uuid("Agendamento obrigatório"))
    .min(1, "Selecione ao menos um agendamento"),
});

export const addAppointmentsSchema = z.object({
  appointmentIds: z
    .array(z.uuid("Agendamento obrigatório"))
    .min(1, "Selecione ao menos um agendamento"),
});

export const cancelTransportSchema = z.object({
  cancelReason: cancelReasonSchema,
});

export type CreateTransportFormData = z.infer<typeof createTransportSchema>;
export type AddAppointmentsFormData = z.infer<typeof addAppointmentsSchema>;
