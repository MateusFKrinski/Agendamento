import { Prisma } from "@/generated/prisma";
import {
  APPOINTMENT_REPORT_SELECT,
  TRANSPORT_REPORT_SELECT,
} from "@/actions/selects/reports";

export type AppointmentReportRow = Prisma.AppointmentGetPayload<{
  select: typeof APPOINTMENT_REPORT_SELECT;
}>;

export type TransportReportRow = Prisma.TransportGetPayload<{
  select: typeof TRANSPORT_REPORT_SELECT;
}>;
