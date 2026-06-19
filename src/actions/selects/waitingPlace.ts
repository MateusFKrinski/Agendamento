import { Prisma } from "@/generated/prisma";

export const WAITING_PLACE_SELECT = {
  id: true,
  name: true,
} satisfies Prisma.WaitingPlaceSelect;
