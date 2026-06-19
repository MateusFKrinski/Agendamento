"use client";

import { useRef } from "react";
import { Button, Card, Chip, Modal, Separator, Spinner } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadIcon,
  TrashIcon,
  PencilIcon,
  SaveIcon,
  FileTextIcon,
} from "lucide-react";
import {
  listDocumentTemplates,
  upsertDocumentTemplate,
  updateDocumentTemplateInfo,
  deleteDocumentTemplate,
} from "@/actions/documentTemplate";
import { useFetch } from "@/lib/hooks/use-fetch";
import { InputTextField } from "@/components/ui/input-text-field";
import { formSubmit } from "@/lib/form-submit";
import { DocumentTemplateRow } from "@/actions/types/documentTemplate";
import {
  createDocumentTemplateSchema,
  updateDocumentTemplateSchema,
  type CreateDocumentTemplateInput,
  type UpdateDocumentTemplateInput,
} from "@/lib/schemas/documentTemplate";
import ButtonField from "@/components/ui/button-field";
import { FetchError } from "@/components/ui/fetch-error";

type DocType = "DAILY_REQUEST" | "ROUTE_MAP";

const DOC_TYPES: { type: DocType; label: string; description: string }[] = [
  {
    type: "DAILY_REQUEST",
    label: "Requisição diária",
    description: "Documento utilizado para requisições diárias de transporte",
  },
  {
    type: "ROUTE_MAP",
    label: "Mapa de rota",
    description: "Documento com o mapa de rotas dos transportes",
  },
];

function EditInfoModal({
  template,
  afterChangeAction,
}: {
  template: DocumentTemplateRow;
  afterChangeAction: () => void;
}) {
  const infoForm = useForm<UpdateDocumentTemplateInput>({
    resolver: zodResolver(updateDocumentTemplateSchema),
    defaultValues: {
      name: template.name,
      description: template.description ?? undefined,
    },
  });

  async function handleSaveInfo() {
    await infoForm.handleSubmit(async (data) => {
      await formSubmit({
        action: () => updateDocumentTemplateInfo(template.id, data),
        successMessage: "Informações atualizadas",
        onSuccess: afterChangeAction,
      });
    })();
  }

  return (
    <Modal>
      <Modal.Trigger>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Editar informações"
        >
          <PencilIcon size={14} />
        </Button>
      </Modal.Trigger>

      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Editar informações</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="flex flex-col gap-3 pb-2">
                <Controller
                  control={infoForm.control}
                  name="name"
                  render={({ field }) => (
                    <InputTextField
                      label="Nome"
                      autoComplete="off"
                      variant="secondary"
                      error={infoForm.formState.errors.name?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  control={infoForm.control}
                  name="description"
                  render={({ field }) => (
                    <InputTextField
                      label="Descrição"
                      autoComplete="off"
                      variant="secondary"
                      error={infoForm.formState.errors.description?.message}
                      {...field}
                    />
                  )}
                />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <div className="flex items-center gap-2 justify-end w-full">
                <Modal.CloseTrigger></Modal.CloseTrigger>
                <ButtonField
                  {...{ size: "sm", onPress: handleSaveInfo }}
                  isSubmitting={infoForm.formState.isSubmitting}
                  label="Salvar"
                  icon={SaveIcon}
                />
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function TemplateCard({
  docType,
  template,
  afterChangeAction,
}: {
  docType: (typeof DOC_TYPES)[number];
  template: DocumentTemplateRow | null;
  afterChangeAction: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadForm = useForm<CreateDocumentTemplateInput>({
    resolver: zodResolver(createDocumentTemplateSchema),
    defaultValues: { fileData: undefined },
  });

  async function handleUpload(file: File) {
    uploadForm.setValue("fileData", file, { shouldValidate: true });

    await uploadForm.handleSubmit(async (data) => {
      await formSubmit({
        action: () => upsertDocumentTemplate(data, docType.type),
        successMessage: template
          ? "Template atualizado com sucesso"
          : "Template cadastrado com sucesso",
        onSuccess: () => {
          afterChangeAction();
          if (fileRef.current) fileRef.current.value = "";
        },
      });
    })();
  }

  async function handleDelete() {
    if (!template) return;
    await formSubmit({
      action: () => deleteDocumentTemplate(template.id),
      successMessage: "Template removido",
      onSuccess: afterChangeAction,
    });
  }

  return (
    <Card className="w-full">
      <Card.Header>
        <div className="flex items-start justify-between w-full px-2">
          <div className="flex items-center gap-3">
            <div
              className={[
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                template ? "bg-accent/10 text-accent" : "bg-default text-muted",
              ].join(" ")}
            >
              <FileTextIcon size={18} />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Card.Title>{template?.name || docType.label}</Card.Title>
                <Chip size="sm" color={template ? "success" : "default"}>
                  {template ? "Cadastrado" : "Sem template"}
                </Chip>
              </div>
              <Card.Description className="text-xs">
                {template ? (
                  <span className="font-mono">{template.fileName}</span>
                ) : (
                  docType.description
                )}
              </Card.Description>
            </div>
          </div>

          {template && (
            <div className="flex items-center gap-1 shrink-0">
              <EditInfoModal
                template={template}
                afterChangeAction={afterChangeAction}
              />
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label="Remover template"
                onPress={handleDelete}
                className="text-danger hover:bg-danger/10"
              >
                <TrashIcon size={14} />
              </Button>
            </div>
          )}
        </div>
      </Card.Header>

      <Card.Content>
        <div className="h-full px-2 flex flex-col gap-4 justify-end">
          {template && (
            <p className="text-xs text-muted">
              Atualizado em{" "}
              {new Date(template.updatedAt).toLocaleDateString("pt-BR")}
            </p>
          )}

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-muted">
              {template
                ? "Substituir arquivo .docx"
                : "Fazer upload do template .docx"}
            </p>

            {uploadForm.formState.errors.fileData && (
              <span className="text-xs text-danger">
                {uploadForm.formState.errors.fileData.message as string}
              </span>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleUpload(file);
              }}
            />

            <ButtonField
              {...{
                size: "sm",
                variant: template ? "ghost" : "primary",
                onPress: () => fileRef.current?.click(),
              }}
              isSubmitting={uploadForm.formState.isSubmitting}
              label={template ? "Substituir arquivo" : "Fazer upload"}
              icon={UploadIcon}
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function Page() {
  const { data, loading, error, refresh } = useFetch(listDocumentTemplates);
  const templates = data?.success ? data.data.templates : [];

  const templateMap = Object.fromEntries(
    templates.map((t) => [t.type, t]),
  ) as Record<DocType, DocumentTemplateRow | undefined>;

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Templates de documentos
        </h1>
        <p className="text-sm text-muted">
          Gerencie os modelos de documentos utilizados pelo sistema
        </p>
      </div>

      <div className="w-full flex justify-center">
        {error ? (
          <FetchError message={error} onRetry={refresh} />
        ) : loading ? (
          <Spinner />
        ) : (
          <div className="w-full flex gap-2">
            {DOC_TYPES.map((docType) => (
              <TemplateCard
                key={docType.type}
                docType={docType}
                template={templateMap[docType.type] ?? null}
                afterChangeAction={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
