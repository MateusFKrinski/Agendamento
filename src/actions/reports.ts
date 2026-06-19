"use server";

import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  buildAppointmentWhere,
  buildTransportWhere,
} from "@/actions/where/reports";
import {
  AppointmentReportRow,
  TransportReportRow,
} from "@/actions/types/reports";
import {
  APPOINTMENT_REPORT_SELECT,
  TRANSPORT_REPORT_SELECT,
} from "@/actions/selects/reports";
import {
  AppointmentReportFilters,
  appointmentReportFiltersSchema,
} from "@/lib/schemas/appointmentReportFilters";
import {
  TransportReportFilters,
  transportReportFiltersSchema,
} from "@/lib/schemas/transportReportFilters";

export const listAppointmentReport = withPermission(
  "read",
  "appointment_report",
  async (
    filters: AppointmentReportFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<
    ActionResult<{
      appointments: AppointmentReportRow[];
      total: number;
      pages: number;
    }>
  > => {
    return createResult(async () => {
      const parsed = appointmentReportFiltersSchema.safeParse(filters);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const where = buildAppointmentWhere(parsed.data);

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          select: APPOINTMENT_REPORT_SELECT,
          orderBy: [{ date: "desc" }, { time: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.appointment.count({ where }),
      ]);

      return { appointments, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const listTransportReport = withPermission(
  "read",
  "transport_report",
  async (
    filters: TransportReportFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<
    ActionResult<{
      transports: TransportReportRow[];
      total: number;
      pages: number;
    }>
  > => {
    return createResult(async () => {
      const parsed = transportReportFiltersSchema.safeParse(filters);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const where = buildTransportWhere(parsed.data);

      let transports = await prisma.transport.findMany({
        where,
        select: TRANSPORT_REPORT_SELECT,
        orderBy: [{ date: "desc" }, { departureTime: "asc" }],
      });

      if (
        filters.minPassengers !== undefined ||
        filters.maxPassengers !== undefined
      ) {
        transports = transports.filter((t) => {
          const total = t.appointments.reduce(
            (acc, a) => acc + 1 + (a.appointment.hasCompanion ? 1 : 0),
            0,
          );
          if (
            filters.minPassengers !== undefined &&
            total < filters.minPassengers
          )
            return false;
          return !(
            filters.maxPassengers !== undefined && total > filters.maxPassengers
          );
        });
      }

      const total = transports.length;
      const paginated = transports.slice((page - 1) * limit, page * limit);

      return { transports: paginated, total, pages: Math.ceil(total / limit) };
    });
  },
);
