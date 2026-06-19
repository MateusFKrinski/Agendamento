import z from "zod";
import { dateSchema } from "@/lib/schemas/fields/dateSchema";
import { searchSchema } from "@/lib/schemas/fields/searchSchema";

export const appointmentReportFiltersSchema = z
  .object({
    dateFrom: dateSchema.optional().or(z.literal("")),
    dateTo: dateSchema.optional().or(z.literal("")),
    search: searchSchema.optional().or(z.literal("")),
    specialtyId: z.uuid("Especialidade inválida").optional().or(z.literal("")),
    healthUnitId: z
      .uuid("Unidade de saúde inválida")
      .optional()
      .or(z.literal("")),
    waitingPlaceId: z
      .uuid("Local de espera inválido")
      .optional()
      .or(z.literal("")),
    status: z
      .enum(["active", "canceled", "pending", "escalated"], {
        message: "Escolha inválida",
      })
      .optional(),
    hasCompanion: z.boolean("Acompanhante não pode ser vazio").optional(),
    createdById: z.uuid("Usuário inválido").optional().or(z.literal("")),
  })
  .refine((val) => !val.dateFrom || !val.dateTo || val.dateFrom <= val.dateTo, {
    message: "Data inicial maior que a data final",
    path: ["dateFrom"],
  });

export type AppointmentReportFilters = z.infer<
  typeof appointmentReportFiltersSchema
>;
