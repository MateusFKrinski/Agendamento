import { z } from "zod";
import { dateSchema } from "@/lib/schemas/fields/dateSchema";
import { timeSchema } from "@/lib/schemas/fields/timeSchema";
import { moneySchema } from "@/lib/schemas/fields/moneySchema";
import { dailyTextSchema } from "@/lib/schemas/fields/dailyTextSchema";

const dailyBaseSchema = z.object({
  transportId: z.uuid("Transporte obrigatório"),
  paymentMethodId: z.uuid("Método de pagamento obrigatório"),
  departureDate: dateSchema,
  returnDate: dateSchema,
  destinationCity: dailyTextSchema,
  orderDate: dateSchema,
  returnTime: timeSchema,
  dailyValue: moneySchema,
  travelPeriod: dailyTextSchema,
  reason: dailyTextSchema,
  overnight: z.boolean("Pernoite não pode ser vazia"),
});

export const generateDailySchema = dailyBaseSchema;

export type GenerateDailyFormData = z.infer<typeof generateDailySchema>;
