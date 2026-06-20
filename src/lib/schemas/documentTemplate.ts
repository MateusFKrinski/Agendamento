import z from "zod";
import { genericNameSchema } from "@/lib/schemas/fields/genericNameSchema";
import { descriptionSchema } from "@/lib/schemas/fields/descriptionSchema";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const documentTemplateBaseSchema = z.object({
  name: genericNameSchema,
  description: descriptionSchema.optional().or(z.literal("")),
  fileData: z
    .instanceof(File, { message: "Arquivo obrigatório" })
    .refine(
      (val) => val.size <= MAX_FILE_SIZE,
      "Arquivo deve ter no máximo 10MB",
    )
    .refine((val) => val.name.endsWith(".docx"), "Arquivo deve ser .docx"),
});

export const createDocumentTemplateSchema = documentTemplateBaseSchema.pick({
  fileData: true,
});

export const updateDocumentTemplateSchema = documentTemplateBaseSchema.pick({
  name: true,
  description: true,
});

export type CreateDocumentTemplateInput = z.infer<
  typeof createDocumentTemplateSchema
>;
export type UpdateDocumentTemplateInput = z.infer<
  typeof updateDocumentTemplateSchema
>;
