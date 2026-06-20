import { Prisma } from "@/generated/prisma";

export const DRIVER_SELECT = {
  id: true,
  name: true,
  cpf: true,
  rg: true,
  role: true,
  birthDate: true,
  phone: true,
  observations: true,
  cnhNumber: true,
  cnhCategory: true,
  cnhExpiration: true,
  deletedAt: true,
  paymentMethods: {
    select: {
      id: true,
      label: true,
      bankName: true,
      bankAgency: true,
      bankAccount: true,
      pixKeyType: true,
      pixKey: true,
    },
  },
} satisfies Prisma.DriverSelect;
