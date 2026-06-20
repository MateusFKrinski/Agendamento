import { Prisma } from "@/generated/prisma";

export const TEMPLATE_SELECT = {
  id: true,
  type: true,
  name: true,
  description: true,
  fileName: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentTemplateSelect;
