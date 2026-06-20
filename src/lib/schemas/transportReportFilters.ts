import z from "zod";
import { dateSchema } from "@/lib/schemas/fields/dateSchema";

export const transportReportFiltersSchema = z
  .object({
    dateFrom: dateSchema.optional().or(z.literal("")),
    dateTo: dateSchema.optional().or(z.literal("")),
    vehicleId: z.uuid("Veículo inválido").optional().or(z.literal("")),
    driverId: z.uuid("Motorista inválido").optional().or(z.literal("")),
    status: z
      .enum(["active", "canceled"], {
        message: "Escolha inválida",
      })
      .optional(),
    createdById: z.uuid("Usuário inválido").optional().or(z.literal("")),
    minPassengers: z
      .number("Valor inválido")
      .int("Valor inválido")
      .positive("Valor inválido")
      .optional(),
    maxPassengers: z
      .number("Valor inválido")
      .int("Valor inválido")
      .positive("Valor inválido")
      .optional(),
  })
  .refine((val) => !val.dateFrom || !val.dateTo || val.dateFrom <= val.dateTo, {
    message: "Data inicial  maior que a data final",
    path: ["dateFrom"],
  })
  .refine(
    (val) =>
      !val.minPassengers ||
      !val.maxPassengers ||
      val.minPassengers <= val.maxPassengers,
    {
      message: "Mínimo de passageiros maior que o máximo",
      path: ["minPassengers"],
    },
  );

export type TransportReportFilters = z.infer<
  typeof transportReportFiltersSchema
>;
