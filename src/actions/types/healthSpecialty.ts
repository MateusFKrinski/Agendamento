import { Prisma } from "@/generated/prisma";
import { SPECIALTY_SELECT } from "@/actions/selects/healthSpecialty";

export type HealthSpecialtyRow = Prisma.HealthSpecialtyGetPayload<{
  select: typeof SPECIALTY_SELECT;
}>;
