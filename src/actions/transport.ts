"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createTransportSchema,
  cancelTransportSchema,
  addAppointmentsSchema,
  updateTransportSchema,
} from "@/lib/schemas/transport";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { Prisma } from "@/generated/prisma";
import { dateRange } from "@/lib/utils/date-helpers";
import {
  PendingAppointmentRow,
  TransportRow,
  TransportSummaryRow,
} from "@/actions/types/transport";
import {
  PENDING_APPOINTMENT_SELECT,
  TRANSPORT_SELECT,
  TRANSPORT_SUMMARY_SELECT,
} from "@/actions/selects/transport";
import { countPassengers } from "@/lib/utils/count-passengers";

export const listPendingAppointments = withPermission(
  "read",
  "transport",
  async (
    date: string,
  ): Promise<ActionResult<{ appointments: PendingAppointmentRow[] }>> => {
    return createResult(async () => {
      const appointments = await prisma.appointment.findMany({
        where: {
          date: dateRange(date),
          isCanceled: false,
          transports: {
            none: {
              transport: { isCanceled: false },
            },
          },
        },
        select: PENDING_APPOINTMENT_SELECT,
        orderBy: { time: "asc" },
      });

      return { appointments };
    });
  },
);

export const listTransports = withPermission(
  "read",
  "transport",
  async (
    page: number = 1,
    date: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{ transports: TransportRow[]; total: number; pages: number }>
  > => {
    return createResult(async () => {
      const where: Prisma.TransportWhereInput = {
        ...(date && { date: dateRange(date) }),
      };

      const [transports, total] = await Promise.all([
        prisma.transport.findMany({
          where,
          select: TRANSPORT_SELECT,
          orderBy: [{ date: "desc" }, { departureTime: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.transport.count({ where }),
      ]);

      const filtered = transports.map((transport) => ({
        ...transport,
        appointments: transport.appointments.filter(
          (a) => !a.appointment.canceledAt,
        ),
      }));

      return { transports: filtered, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const listTransportsByDate = withPermission(
  "read",
  "transport",
  async (
    date: string,
  ): Promise<ActionResult<{ transports: TransportSummaryRow[] }>> => {
    return createResult(async () => {
      const transports = await prisma.transport.findMany({
        where: {
          date: dateRange(date),
          isCanceled: false,
        },
        select: TRANSPORT_SUMMARY_SELECT,
        orderBy: { departureTime: "asc" },
      });

      return { transports };
    });
  },
);

export const getTransportById = withPermission(
  "read",
  "transport",
  async (id: string): Promise<ActionResult<{ transport: TransportRow }>> => {
    return createResult(async () => {
      const transport = await prisma.transport.findUnique({
        where: { id },
        select: TRANSPORT_SELECT,
      });
      if (!transport) throw new Error("Transporte não encontrado");

      return { transport };
    });
  },
);

export const createTransport = withPermission(
  "create",
  "transport",
  async (data: unknown): Promise<ActionResult<{ transportId: string }>> => {
    return createResult(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Não autenticado");

      const parsed = createTransportSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parsed.data.vehicleId },
        select: { capacity: true },
      });
      if (!vehicle) throw new Error("Veículo não encontrado");

      const appointments = await prisma.appointment.findMany({
        where: { id: { in: parsed.data.appointmentIds } },
        select: { patientId: true, hasCompanion: true, companionId: true },
      });

      const totalPassengers = countPassengers(appointments);
      const availableSeats = vehicle.capacity - 1;

      if (totalPassengers > availableSeats) {
        throw new Error(
          `${totalPassengers} passageiros para ${availableSeats} vagas disponíveis`,
        );
      }

      const transport = await prisma.transport.create({
        data: {
          date: new Date(`${parsed.data.date}T00:00:00.000Z`),
          departureTime: parsed.data.departureTime,
          observations: parsed.data.observations || null,
          vehicleId: parsed.data.vehicleId,
          driverId: parsed.data.driverId,
          createdById: session.user.id,
          appointments: {
            create: parsed.data.appointmentIds.map((appointmentId) => ({
              appointmentId,
              direction: "ROUND_TRIP",
            })),
          },
        },
      });

      return { transportId: transport.id };
    });
  },
);

export const addAppointmentsToTransport = withAllPermissions(
  ["read"],
  "transport",
  async (transportId: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = addAppointmentsSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const transport = await prisma.transport.findUnique({
        where: { id: transportId },
        select: {
          isCanceled: true,
          vehicle: { select: { capacity: true } },
          appointments: {
            select: {
              appointment: {
                select: {
                  patientId: true,
                  hasCompanion: true,
                  companionId: true,
                },
              },
            },
          },
        },
      });

      if (!transport) throw new Error("Transporte não encontrado");
      if (transport.isCanceled)
        throw new Error(
          "Não é possível adicionar agendamentos a um transporte cancelado",
        );

      const newAppointments = await prisma.appointment.findMany({
        where: { id: { in: parsed.data.appointmentIds } },
        select: { patientId: true, hasCompanion: true, companionId: true },
      });

      const allAppointments = [
        ...transport.appointments.map((a) => a.appointment),
        ...newAppointments,
      ];

      const availableSeats = transport.vehicle.capacity - 1;
      const totalAfter = countPassengers(allAppointments);

      if (totalAfter > availableSeats) {
        throw new Error(
          `${totalAfter} passageiros para ${availableSeats} vagas disponíveis`,
        );
      }

      await prisma.appointmentTransport.createMany({
        data: parsed.data.appointmentIds.map((appointmentId) => ({
          appointmentId,
          transportId,
          direction: "ROUND_TRIP",
        })),
      });
    });
  },
);

export const removeAppointmentFromTransport = withAllPermissions(
  ["read"],
  "transport",
  async (
    transportId: string,
    appointmentId: string,
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const transport = await prisma.transport.findUnique({
        where: { id: transportId },
        select: { isCanceled: true },
      });

      if (!transport) throw new Error("Transporte não encontrado");
      if (transport.isCanceled)
        throw new Error(
          "Não é possível remover agendamentos de um transporte cancelado",
        );

      await prisma.appointmentTransport.deleteMany({
        where: { transportId, appointmentId },
      });
    });
  },
);

export const updateTransport = withAllPermissions(
  ["read"],
  "transport",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateTransportSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const transport = await prisma.transport.findUnique({
        where: { id },
        select: { isCanceled: true },
      });
      if (!transport) throw new Error("Transporte não encontrado");
      if (transport.isCanceled)
        throw new Error("Não é possível editar um transporte cancelado");

      await prisma.transport.update({
        where: { id },
        data: {
          departureTime: parsed.data.departureTime,
          driverId: parsed.data.driverId,
          observations: parsed.data.observations || null,
        },
      });
    });
  },
);

export const cancelTransport = withAllPermissions(
  ["read"],
  "transport",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Não autenticado");

      const parsed = cancelTransportSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const transport = await prisma.transport.findUnique({ where: { id } });
      if (!transport) throw new Error("Transporte não encontrado");
      if (transport.isCanceled) throw new Error("Transporte já está cancelado");

      await prisma.transport.update({
        where: { id },
        data: {
          isCanceled: true,
          cancelReason: parsed.data.cancelReason,
          canceledAt: new Date(),
          canceledById: session.user.id,
        },
      });
    });
  },
);
