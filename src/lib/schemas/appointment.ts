import { z } from "zod";
import { observationsSchema } from "./fields/observationsSchema";
import { timeSchema } from "./fields/timeSchema";
import { dateSchema } from "./fields/dateSchema";
import { cancelReasonSchema } from "./fields/cancelReasonSchema";

const appointmentBaseSchema = z
  .object({
    date: dateSchema,
    time: timeSchema,
    patientId: z.uuid("Paciente obrigatório"),
    hasCompanion: z.boolean(),
    companionId: z
      .uuid("Acompanhante obrigatório")
      .optional()
      .or(z.literal("")),
    healthSpecialtyId: z.uuid("Especialidade obrigatória"),
    healthUnitId: z.uuid("Unidade de saúde obrigatória"),
    waitingPlaceId: z.uuid("Local de espera obrigatório"),
    observations: observationsSchema.optional().or(z.literal("")),
  })
  .refine((data) => !data.hasCompanion || !!data.companionId, {
    message: "Selecione o acompanhante",
    path: ["companionId"],
  })
  .refine((data) => !data.companionId || data.companionId !== data.patientId, {
    message: "O acompanhante não pode ser o próprio paciente",
    path: ["companionId"],
  });

export const createAppointmentSchema = appointmentBaseSchema;
export const updateAppointmentSchema = appointmentBaseSchema;
export const cancelAppointmentSchema = z.object({
  cancelReason: cancelReasonSchema,
});

export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>;
