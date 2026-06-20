"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentMethodSchema,
  type PaymentMethodFormData,
  PIX_KEY_TYPES,
} from "@/lib/schemas/fields/paymentMethodSchema";
import { addPaymentMethod } from "@/actions/driver";
import { Form, Button } from "@heroui/react";
import { PlusIcon, LandmarkIcon, QrCodeIcon, TagIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { SelectField } from "@/components/ui/select-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";

const PIX_LABELS: Record<string, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  RANDOM: "Aleatória",
};

export default function PaymentMethodCreateForm({
  driverId,
  afterSubmitAction,
  onCancelAction,
}: {
  driverId: string;
  afterSubmitAction: () => void;
  onCancelAction: () => void;
}) {
  const variant = "secondary";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      label: "",
      bankName: "",
      bankAgency: "",
      bankAccount: "",
      pixKeyType: "CPF",
      pixKey: "",
    },
  });

  async function onSubmit(data: PaymentMethodFormData) {
    await formSubmit({
      action: () => addPaymentMethod(driverId, data),
      successMessage: "Método de pagamento adicionado",
      onSuccess: afterSubmitAction,
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 p-3 rounded-lg border border-dashed border-border"
    >
      {errors.root?.message && (
        <p className="text-xs text-danger">{errors.root.message}</p>
      )}

      <Controller
        name="label"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Identificação"
            placeholder="Ex: Conta principal"
            icon={TagIcon}
            error={errors.label?.message}
            autoComplete="off"
            variant={variant}
            {...field}
          />
        )}
      />

      <p className="text-[10px] uppercase tracking-widest text-muted">
        Dados bancários
      </p>

      <Controller
        name="bankName"
        control={control}
        render={({ field }) => (
          <InputTextField
            label="Banco"
            placeholder="Nome do banco"
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
              placeholder="0000"
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
              placeholder="00000-0"
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
              placeholder="Chave PIX"
              error={errors.pixKey?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Adicionar método"
          icon={PlusIcon}
        />
        <Button type="button" variant="ghost" onPress={onCancelAction}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}
