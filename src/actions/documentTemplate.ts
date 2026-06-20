"use server";

import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import { TEMPLATE_SELECT } from "@/actions/selects/documentTemplate";
import { DocumentTemplateRow } from "@/actions/types/documentTemplate";
import {
  CreateDocumentTemplateInput,
  createDocumentTemplateSchema,
  UpdateDocumentTemplateInput,
  updateDocumentTemplateSchema,
} from "@/lib/schemas/documentTemplate";

export const listDocumentTemplates = withPermission(
  "read",
  "documents",
  async (): Promise<ActionResult<{ templates: DocumentTemplateRow[] }>> => {
    return createResult(async () => {
      const templates = await prisma.documentTemplate.findMany({
        select: TEMPLATE_SELECT,
        orderBy: { type: "asc" },
      });
      return { templates };
    });
  },
);

export const upsertDocumentTemplate = withPermission(
  "create",
  "documents",
  async (
    data: CreateDocumentTemplateInput,
    docType: "DAILY_REQUEST" | "ROUTE_MAP",
  ): Promise<ActionResult<{ templateId: string }>> => {
    return createResult(async () => {
      const parsed = createDocumentTemplateSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const arrayBuffer = await parsed.data.fileData.arrayBuffer();
      const fileData = Array.from(new Uint8Array(arrayBuffer));
      const buffer = Buffer.from(fileData);

      const template = await prisma.documentTemplate.upsert({
        where: { type: docType },
        update: {
          fileName: parsed.data.fileData.name,
          fileData: buffer,
        },
        create: {
          type: docType,
          name: parsed.data.fileData.name,
          fileName: parsed.data.fileData.name,
          fileData: buffer,
        },
      });
      return { templateId: template.id };
    });
  },
);

export const updateDocumentTemplateInfo = withPermission(
  "update",
  "documents",
  async (
    id: string,
    data: UpdateDocumentTemplateInput,
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateDocumentTemplateSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      await prisma.documentTemplate.update({
        where: { id },
        data: { ...parsed.data },
      });
    });
  },
);

export const deleteDocumentTemplate = withPermission(
  "read",
  "documents",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.documentTemplate.delete({ where: { id } });
    });
  },
);
