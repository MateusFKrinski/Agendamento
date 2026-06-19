"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
  updateAppointmentSchema,
} from "@/lib/schemas/appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { Prisma } from "@/generated/prisma";
import { AppointmentRow } from "@/actions/types/appointment";
import { dateRange } from "@/lib/utils/date-helpers";
import { APPOINTMENT_SELECT } from "@/actions/selects/appointment";

export const listAppointments = withPermission(
  "read",
  "appointment",
  async (
    page: number = 1,
    search: string = "",
    date: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{
      appointments: AppointmentRow[];
      total: number;
      pages: number;
    }>
  > => {
    return createResult(async () => {
      const where: Prisma.AppointmentWhereInput = {
        ...(date && { date: dateRange(date) }),
        ...(search && {
          patient: { name: { contains: search, mode: "insensitive" } },
        }),
      };

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          select: APPOINTMENT_SELECT,
          orderBy: [
            { patient: { name: "asc" } },
            { date: "asc" },
            { time: "asc" },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.appointment.count({ where }),
      ]);

      return { appointments, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createAppointment = withPermission(
  "create",
  "appointment",
  async (data: unknown): Promise<ActionResult<{ appointmentId: string }>> => {
    return createResult(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Não autenticado");

      const parsed = createAppointmentSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(`${parsed.data.date}T00:00:00.000Z`),
          time: parsed.data.time,
          observations: parsed.data.observations,
          patientId: parsed.data.patientId,
          hasCompanion: parsed.data.hasCompanion,
          companionId: parsed.data.companionId ?? null,
          healthSpecialtyId: parsed.data.healthSpecialtyId,
          healthUnitId: parsed.data.healthUnitId,
          waitingPlaceId: parsed.data.waitingPlaceId,
          createdById: session.user.id,
        },
      });

      return { appointmentId: appointment.id };
    });
  },
);

export const updateAppointment = withAllPermissions(
  ["read", "update"],
  "appointment",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateAppointmentSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        select: { isCanceled: true, date: true },
      });
      if (!appointment) throw new Error("Agendamento não encontrado");
      if (appointment.isCanceled)
        throw new Error("Não é possível editar um agendamento cancelado");

      const newDate = new Date(`${parsed.data.date}T00:00:00.000Z`);
      const dateChanged = appointment.date.getTime() !== newDate.getTime();

      await prisma.appointment.update({
        where: { id },
        data: {
          date: newDate,
          time: parsed.data.time,
          observations: parsed.data.observations,
          patientId: parsed.data.patientId,
          hasCompanion: parsed.data.hasCompanion,
          companionId: parsed.data.companionId ?? null,
          healthSpecialtyId: parsed.data.healthSpecialtyId,
          healthUnitId: parsed.data.healthUnitId,
          waitingPlaceId: parsed.data.waitingPlaceId,
        },
      });

      if (dateChanged) {
        await prisma.appointmentTransport.deleteMany({
          where: {
            appointmentId: id,
            transport: { date: { not: newDate } },
          },
        });
      }
    });
  },
);

export const cancelAppointment = withAllPermissions(
  ["read", "update"],
  "appointment",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Não autenticado");

      const parsed = cancelAppointmentSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });
      if (!appointment) throw new Error("Agendamento não encontrado");
      if (appointment.isCanceled)
        throw new Error("Agendamento já está cancelado");

      await prisma.$transaction([
        prisma.appointmentTransport.deleteMany({
          where: { appointmentId: id },
        }),
        prisma.appointment.update({
          where: { id },
          data: {
            isCanceled: true,
            cancelReason: parsed.data.cancelReason,
            canceledAt: new Date(),
            canceledById: session.user.id,
          },
        }),
      ]);
    });
  },
);
