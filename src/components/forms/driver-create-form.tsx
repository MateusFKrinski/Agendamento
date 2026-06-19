"use client";

import { useForm, Controller, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDriverSchema,
  type CreateDriverFormData,
  DriverBaseFormData,
} from "@/lib/schemas/driver";
import { createDriver } from "@/actions/driver";
import { Form, Button } from "@heroui/react";
import {
  SaveIcon,
  PlusIcon,
  TrashIcon,
  LandmarkIcon,
  QrCodeIcon,
  TagIcon,
} from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { SelectField } from "@/components/ui/select-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { PIX_KEY_TYPES } from "@/lib/schemas/fields/paymentMethodSchema";
import { DriverFormFields } from "@/components/forms/driver-form-fields";
import { Separator } from "@heroui/react";
import SectionLabel from "@/components/ui/section-label";

const PIX_LABELS: Record<string, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  RANDOM: "Aleatória",
};

export default function DriverCreateForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDriverFormData>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: "",
      cpf: "",
      rg: "",
      role: "",
      birthDate: "",
      phone: "",
      observations: undefined,
      cnhNumber: "",
      cnhCategory: "B",
      cnhExpiration: "",
      paymentMethods: [
        {
          label: "",
          bankName: undefined,
          bankAgency: undefined,
          bankAccount: undefined,
          pixKeyType: undefined,
          pixKey: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentMethods",
  });

  async function onSubmit(data: CreateDriverFormData) {
    await formSubmit({
      action: () => createDriver(data),
      successMessage: "Motorista cadastrado com sucesso",
      onSuccess: () => reset(),
    });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <DriverFormFields
        control={control as unknown as Control<DriverBaseFormData>}
        errors={errors}
      />

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Métodos de pagamento</SectionLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onPress={() =>
              append({
                label: "",
                bankName: "",
                bankAgency: "",
                bankAccount: "",
                pixKeyType: "CPF",
                pixKey: "",
              })
            }
          >
            <PlusIcon size={14} />
            Adicionar
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-3 p-3 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between gap-3">
              <Controller
                name={`paymentMethods.${index}.label`}
                control={control}
                render={({ field }) => (
                  <InputTextField
                    variant="primary"
                    label="Identificação"
                    placeholder="Ex: Conta principal"
                    icon={TagIcon}
                    error={errors.paymentMethods?.[index]?.label?.message}
                    autoComplete="off"
                    {...field}
                  />
                )}
              />

              {fields.length > 1 && (
                <Button
                  type="button"
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:bg-danger/10 mt-6 shrink-0"
                  onPress={() => remove(index)}
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
              name={`paymentMethods.${index}.bankName`}
              control={control}
              render={({ field }) => (
                <InputTextField
                  variant="primary"
                  label="Banco"
                  placeholder="Nome do banco"
                  icon={LandmarkIcon}
                  error={errors.paymentMethods?.[index]?.bankName?.message}
                  autoComplete="off"
                  {...field}
                />
              )}
            />

            <div className="grid gap-3 grid-cols-2">
              <Controller
                name={`paymentMethods.${index}.bankAgency`}
                control={control}
                render={({ field }) => (
                  <InputTextField
                    variant="primary"
                    label="Agência"
                    placeholder="0000"
                    error={errors.paymentMethods?.[index]?.bankAgency?.message}
                    autoComplete="off"
                    {...field}
                  />
                )}
              />

              <Controller
                name={`paymentMethods.${index}.bankAccount`}
                control={control}
                render={({ field }) => (
                  <InputTextField
                    variant="primary"
                    label="Conta"
                    placeholder="00000-0"
                    error={errors.paymentMethods?.[index]?.bankAccount?.message}
                    autoComplete="off"
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
                name={`paymentMethods.${index}.pixKeyType`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Tipo"
                    icon={QrCodeIcon}
                    error={errors.paymentMethods?.[index]?.pixKeyType?.message}
                    options={PIX_KEY_TYPES.map((t) => ({
                      label: PIX_LABELS[t],
                      value: t,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    variant="primary"
                  />
                )}
              />

              <Controller
                name={`paymentMethods.${index}.pixKey`}
                control={control}
                render={({ field }) => (
                  <InputTextField
                    variant="primary"
                    label="Chave"
                    placeholder="Chave PIX"
                    error={errors.paymentMethods?.[index]?.pixKey?.message}
                    autoComplete="off"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Cadastrar motorista"
        icon={SaveIcon}
      />
    </Form>
  );
}
