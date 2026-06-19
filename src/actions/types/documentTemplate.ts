import { Prisma } from "@/generated/prisma";
import { TEMPLATE_SELECT } from "@/actions/selects/documentTemplate";

export type DocumentTemplateRow = Prisma.DocumentTemplateGetPayload<{
  select: typeof TEMPLATE_SELECT;
}>;
