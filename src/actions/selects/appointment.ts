import { Prisma } from "@/generated/prisma";

export const APPOINTMENT_SELECT = {
  id: true,
  date: true,
  time: true,
  observations: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  hasCompanion: true,
  patient: { select: { id: true, name: true, cpf: true } },
  companion: { select: { id: true, name: true } },
  healthSpecialty: { select: { id: true, name: true } },
  healthUnit: { select: { id: true, unitName: true } },
  waitingPlace: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  canceledBy: { select: { id: true, name: true } },
  transports: {
    select: {
      direction: true,
      transport: {
        select: { id: true, date: true, departureTime: true, isCanceled: true },
      },
    },
  },
} satisfies Prisma.AppointmentSelect;
