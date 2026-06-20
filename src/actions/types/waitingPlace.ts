import { Prisma } from "@/generated/prisma";
import { WAITING_PLACE_SELECT } from "@/actions/selects/waitingPlace";

export type WaitingPlaceRow = Prisma.WaitingPlaceGetPayload<{
  select: typeof WAITING_PLACE_SELECT;
}>;
