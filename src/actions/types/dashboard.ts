import { Prisma } from "@/generated/prisma";
import {
  DASHBOARD_APPOINTMENT_SELECT,
  DASHBOARD_TRANSPORT_SELECT,
} from "@/actions/selects/dashboard";

export type AppointmentRow = Prisma.AppointmentGetPayload<{
  select: typeof DASHBOARD_APPOINTMENT_SELECT;
}>;

export type TransportRow = Prisma.TransportGetPayload<{
  select: typeof DASHBOARD_TRANSPORT_SELECT;
}>;

export type DashboardData = {
  metrics: {
    appointmentsToday: number;
    appointmentsPending: number;
    transportsToday: number;
  };
  appointments: AppointmentRow[];
  transports: TransportRow[];
};
