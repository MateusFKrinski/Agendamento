import { Prisma } from "@/generated/prisma";

export const SPECIALTY_SELECT = {
  id: true,
  name: true,
  observations: true,
  deletedAt: true,
} satisfies Prisma.HealthSpecialtySelect;
