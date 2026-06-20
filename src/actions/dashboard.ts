"use server";

import { prisma } from "@/lib/prisma";
import { createResult, ActionResult } from "@/lib/action-result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { dateRange, todayString } from "@/lib/utils/date-helpers";
import {
  DASHBOARD_APPOINTMENT_SELECT,
  DASHBOARD_TRANSPORT_SELECT,
} from "@/actions/selects/dashboard";
import {
  AppointmentRow,
  DashboardData,
  TransportRow,
} from "@/actions/types/dashboard";

export const getDashboardData = async (
  date: string = todayString(),
): Promise<ActionResult<DashboardData>> => {
  return createResult(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autenticado");

    const range = dateRange(date);

    const [
      appointmentsToday,
      appointmentsPending,
      transportsToday,
      appointments,
      transports,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { date: range, isCanceled: false },
      }),
      prisma.appointment.count({
        where: {
          date: range,
          isCanceled: false,
          transports: { none: { transport: { isCanceled: false } } },
        },
      }),
      prisma.transport.count({
        where: { date: range, isCanceled: false },
      }),

      prisma.appointment.findMany({
        where: { date: range },
        orderBy: { time: "asc" },
        select: DASHBOARD_APPOINTMENT_SELECT,
      }),

      prisma.transport.findMany({
        where: { date: range },
        orderBy: { departureTime: "asc" },
        select: DASHBOARD_TRANSPORT_SELECT,
      }),
    ]);

    return {
      metrics: {
        appointmentsToday,
        appointmentsPending,
        transportsToday,
      },
      appointments: appointments as AppointmentRow[],
      transports: transports as TransportRow[],
    };
  });
};
