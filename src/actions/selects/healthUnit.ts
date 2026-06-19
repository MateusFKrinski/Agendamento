import { Prisma } from "@/generated/prisma";

export const HEALTH_UNIT_SELECT = {
  id: true,
  unitName: true,
  unitType: true,
  cnpj: true,
  phone: true,
  email: true,
  observations: true,
  deletedAt: true,
  address: {
    select: {
      id: true,
      zipCode: true,
      street: true,
      number: true,
      complement: true,
      district: true,
      city: true,
      state: true,
    },
  },
} satisfies Prisma.HealthUnitSelect;
