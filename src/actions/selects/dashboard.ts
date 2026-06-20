import { Prisma } from "@/generated/prisma";

export const DASHBOARD_APPOINTMENT_SELECT = {
  id: true,
  time: true,
  hasCompanion: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  observations: true,
  patient: { select: { name: true } },
  companion: { select: { name: true } },
  healthUnit: { select: { unitName: true } },
  healthSpecialty: { select: { name: true } },
  waitingPlace: { select: { name: true } },
  createdBy: { select: { name: true } },
  canceledBy: { select: { name: true } },
  transports: {
    where: { transport: { isCanceled: false } },
    select: { direction: true },
  },
} satisfies Prisma.AppointmentSelect;

export const DASHBOARD_TRANSPORT_SELECT = {
  id: true,
  departureTime: true,
  observations: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  vehicle: {
    select: { plate: true, model: true, brand: true, capacity: true },
  },
  driver: { select: { name: true } },
  createdBy: { select: { name: true } },
  canceledBy: { select: { name: true } },
  appointments: {
    select: {
      appointment: {
        select: {
          time: true,
          hasCompanion: true,
          patient: { select: { id: true, name: true } },
          companion: { select: { id: true, name: true } },
          healthUnit: { select: { unitName: true } },
          waitingPlace: { select: { name: true } },
          healthSpecialty: { select: { name: true } },
        },
      },
    },
  },
} satisfies Prisma.TransportSelect;
