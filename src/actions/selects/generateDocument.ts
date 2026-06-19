import { Prisma } from "@/generated/prisma";

export const GENERATE_DOCUMENT_DAILY_SELECT = {
  date: true,
  departureTime: true,
  driver: {
    select: {
      name: true,
      cpf: true,
      rg: true,
      role: true,
      paymentMethods: {
        select: {
          id: true,
          bankName: true,
          bankAgency: true,
          bankAccount: true,
        },
      },
    },
  },
  vehicle: { select: { plate: true, model: true, brand: true } },
  appointments: {
    where: { appointment: { canceledAt: null } },
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

export const GENERATE_DOCUMENT_ROUTE_MAP_SELECT = {
  date: true,
  departureTime: true,
  driver: { select: { name: true } },
  vehicle: { select: { plate: true, model: true, brand: true } },
  appointments: {
    where: { appointment: { canceledAt: null } },
    select: {
      appointment: {
        select: {
          time: true,
          date: true,
          hasCompanion: true,
          patient: {
            select: { id: true, name: true, phone: true },
          },
          companion: {
            select: { id: true, name: true, phone: true },
          },
          healthSpecialty: { select: { name: true } },
          healthUnit: {
            select: {
              id: true,
              unitName: true,
              cnpj: true,
              phone: true,
              unitType: true,
              address: {
                select: {
                  street: true,
                  number: true,
                  complement: true,
                  district: true,
                  city: true,
                  state: true,
                  zipCode: true,
                },
              },
            },
          },
          waitingPlace: { select: { name: true } },
        },
      },
    },
  },
} satisfies Prisma.TransportSelect;
