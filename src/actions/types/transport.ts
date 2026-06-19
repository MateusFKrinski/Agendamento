import {PENDING_APPOINTMENT_SELECT, TRANSPORT_SELECT, TRANSPORT_SUMMARY_SELECT} from "@/actions/selects/transport";
import {Prisma} from "@/generated/prisma";

export type TransportRow = Prisma.TransportGetPayload<{
    select: typeof TRANSPORT_SELECT;
}>;

export type TransportSummaryRow = Prisma.TransportGetPayload<{
    select: typeof TRANSPORT_SUMMARY_SELECT;
}>;

export type PendingAppointmentRow = Prisma.AppointmentGetPayload<{
    select: typeof PENDING_APPOINTMENT_SELECT;
}>;