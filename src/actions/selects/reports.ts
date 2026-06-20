import { Prisma } from "@/generated/prisma";

export const APPOINTMENT_REPORT_SELECT = {
  id: true,
  date: true,
  time: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  hasCompanion: true,
  observations: true,
  patient: { select: { id: true, name: true, cpf: true } },
  companion: { select: { id: true, name: true } },
  healthSpecialty: { select: { id: true, name: true } },
  healthUnit: { select: { id: true, unitName: true } },
  waitingPlace: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  canceledBy: { select: { id: true, name: true } },
  transports: {
    where: { transport: { isCanceled: false } },
    select: { direction: true },
  },
} satisfies Prisma.AppointmentSelect;

export const TRANSPORT_REPORT_SELECT = {
  id: true,
  date: true,
  departureTime: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  vehicle: {
    select: { id: true, plate: true, model: true, brand: true, capacity: true },
  },
  driver: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  canceledBy: { select: { id: true, name: true } },
  appointments: {
    select: {
      direction: true,
      appointment: {
        select: {
          id: true,
          time: true,
          hasCompanion: true,
          patient: { select: { id: true, name: true } },
          companion: { select: { id: true, name: true } },
          healthUnit: { select: { id: true, unitName: true } },
          waitingPlace: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.TransportSelect;
