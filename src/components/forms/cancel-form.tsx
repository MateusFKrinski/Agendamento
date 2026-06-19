"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@heroui/react";
import { XCircleIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import ButtonField from "@/components/ui/button-field";
import { ActionResult, formSubmit } from "@/lib/form-submit";

const cancelSchema = z.object({
  cancelReason: z.string().min(1, "Informe o motivo do cancelamento"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

interface CancelFormProps {
  onCancel: (data: CancelFormData) => Promise<ActionResult>;
  afterSubmitAction: () => void;
  successMessage?: string;
}

export default function CancelForm({
  onCancel,
  afterSubmitAction,
  successMessage = "Cancelamento realizado com sucesso",
}: CancelFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { cancelReason: "" },
  });

  async function onSubmit(data: CancelFormData) {
    await formSubmit({
      action: () => onCancel(data),
      successMessage,
      onSuccess: afterSubmitAction,
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-2.5"
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
        Motivo do cancelamento
      </p>
      <Controller
        name="cancelReason"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Motivo"
            placeholder="Descreva o motivo do cancelamento..."
            error={errors.cancelReason?.message}
            autoComplete="off"
            variant="secondary"
            {...field}
          />
        )}
      />
      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Confirmar cancelamento"
        icon={XCircleIcon}
      />
    </Form>
  );
}
