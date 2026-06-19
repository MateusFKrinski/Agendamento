"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  paymentMethodSchema,
  type PaymentMethodFormData,
  PIX_KEY_TYPES,
} from "@/lib/schemas/fields/paymentMethodSchema";
import { updatePaymentMethod, deletePaymentMethod } from "@/actions/driver";
import { Form, Button } from "@heroui/react";
import {
  SaveIcon,
  TrashIcon,
  LandmarkIcon,
  QrCodeIcon,
  TagIcon,
} from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { SelectField } from "@/components/ui/select-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import type { DriverRow } from "@/actions/types/driver";
import { useState } from "react";

const PIX_LABELS: Record<string, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  RANDOM: "Aleatória",
};

export default function PaymentMethodForm({
  method,
  canRemove,
  afterSubmitAction,
}: {
  method: DriverRow["paymentMethods"][number];
  canRemove: boolean;
  afterSubmitAction: () => void;
}) {
  const variant = "secondary";

  const [loadingRemove, setLoadingRemove] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      label: method.label,
      bankName: method.bankName ?? "",
      bankAgency: method.bankAgency ?? "",
      bankAccount: method.bankAccount ?? "",
      pixKeyType: method.pixKeyType ?? "CPF",
      pixKey: method.pixKey ?? "",
    },
  });

  async function onSubmit(data: PaymentMethodFormData) {
    await formSubmit({
      action: () => updatePaymentMethod(method.id, data),
      successMessage: "Método de pagamento atualizado",
      onSuccess: afterSubmitAction,
    });
  }

  async function handleRemove() {
    setLoadingRemove(true);
    await formSubmit({
      action: () => deletePaymentMethod(method.id),
      successMessage: "Método de pagamento removido",
      onSuccess: afterSubmitAction,
    });
    setLoadingRemove(false);
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 p-3 rounded-lg border border-border"
    >
      {errors.root?.message && (
        <p className="text-xs text-danger">{errors.root.message}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Identificação"
              icon={TagIcon}
              error={errors.label?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        {canRemove && (
          <Button
            type="button"
            isIconOnly
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10 mt-6 shrink-0"
            isDisabled={loadingRemove}
            onPress={handleRemove}
            aria-label="Remover método"
          >
            <TrashIcon size={14} />
          </Button>
        )}
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted">
        Dados bancários
      </p>

      <Controller
        name="bankName"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Banco"
            icon={LandmarkIcon}
            error={errors.bankName?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />

      <div className="grid gap-3 grid-cols-2">
        <Controller
          name="bankAgency"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Agência"
              error={errors.bankAgency?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <Controller
          name="bankAccount"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Conta"
              error={errors.bankAccount?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted">
        Chave PIX
      </p>

      <div className="grid gap-3 grid-cols-2">
        <Controller
          name="pixKeyType"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Tipo"
              icon={QrCodeIcon}
              error={errors.pixKeyType?.message}
              options={PIX_KEY_TYPES.map((t) => ({
                label: PIX_LABELS[t],
                value: t,
              }))}
              value={field.value}
              onChange={field.onChange}
              variant={variant}
            />
          )}
        />

        <Controller
          name="pixKey"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Chave"
              error={errors.pixKey?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Salvar método"
        icon={SaveIcon}
      />
    </Form>
  );
}
