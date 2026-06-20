import { APPOINTMENT_SELECT } from "@/actions/selects/appointment";
import { Prisma } from "@/generated/prisma";

export type AppointmentRow = Prisma.AppointmentGetPayload<{
  select: typeof APPOINTMENT_SELECT;
}>;
