import { Prisma } from "@/generated/prisma";

export const PERSON_SELECT = {
  id: true,
  name: true,
  cpf: true,
  birthDate: true,
  phone: true,
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
} satisfies Prisma.PersonSelect;
