import { Prisma } from "@/generated/prisma";

export const TRANSPORT_SELECT = {
  id: true,
  date: true,
  departureTime: true,
  isCanceled: true,
  cancelReason: true,
  canceledAt: true,
  vehicle: {
    select: { id: true, plate: true, model: true, brand: true, capacity: true },
  },
  driver: {
    select: {
      id: true,
      name: true,
      cpf: true,
      rg: true,
      role: true,
      paymentMethods: {
        select: {
          id: true,
          label: true,
          bankName: true,
          bankAgency: true,
          bankAccount: true,
        },
      },
    },
  },
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
          canceledAt: true,
          patient: { select: { id: true, name: true } },
          companion: { select: { id: true, name: true } },
          healthUnit: {
            select: {
              id: true,
              unitName: true,
              address: {
                select: {
                  id: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          waitingPlace: { select: { id: true, name: true } },
          healthSpecialty: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.TransportSelect;

export const TRANSPORT_SUMMARY_SELECT = {
  id: true,
  departureTime: true,
  vehicle: {
    select: { id: true, plate: true, model: true, brand: true, capacity: true },
  },
  driver: { select: { id: true, name: true } },
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
} satisfies Prisma.TransportSelect;

export const PENDING_APPOINTMENT_SELECT = {
  id: true,
  time: true,
  hasCompanion: true,
  observations: true,
  patient: { select: { id: true, name: true, cpf: true } },
  companion: { select: { id: true, name: true } },
  healthUnit: {
    select: {
      id: true,
      unitName: true,
      address: {
        select: {
          id: true,
          street: true,
          number: true,
          complement: true,
          district: true,
          city: true,
          state: true,
        },
      },
    },
  },
  healthSpecialty: { select: { id: true, name: true } },
  waitingPlace: { select: { id: true, name: true } },
} satisfies Prisma.AppointmentSelect;
