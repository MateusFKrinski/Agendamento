import { Prisma } from "@/generated/prisma";
import { PERSON_SELECT } from "@/actions/selects/person";

export type PersonRow = Prisma.PersonGetPayload<{
  select: typeof PERSON_SELECT;
}>;
