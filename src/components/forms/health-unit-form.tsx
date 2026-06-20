"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createHealthUnitSchema,
  updateHealthUnitSchema,
  type CreateHealthUnitFormData,
  type UpdateHealthUnitFormData,
  UNIT_TYPES,
  UNIT_TYPE_LABELS,
} from "@/lib/schemas/healthUnit";
import { createHealthUnit, updateHealthUnit } from "@/actions/healthUnit";
import { HealthUnitRow } from "@/actions/types/healthUnit";
import { Form, Separator } from "@heroui/react";
import {
  BuildingIcon,
  HashIcon,
  HomeIcon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  PhoneIcon,
  SaveIcon,
} from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { SelectField } from "@/components/ui/select-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { maskCNPJ, maskPhone, maskZipCode } from "@/lib/utils/masks";
import SectionLabel from "@/components/ui/section-label";

type FormData = CreateHealthUnitFormData | UpdateHealthUnitFormData;

const CREATE_DEFAULTS: CreateHealthUnitFormData = {
  unitName: "",
  unitType: "HOSPITAL",
  cnpj: "",
  phone: "",
  email: "",
  observations: undefined,
  address: {
    zipCode: "",
    street: "",
    number: "",
    complement: undefined,
    district: "",
    city: "",
    state: "",
  },
};

interface HealthUnitFormProps {
  unit?: HealthUnitRow;
  afterSubmitAction?: () => void;
}

export default function HealthUnitForm({
  unit,
  afterSubmitAction,
}: HealthUnitFormProps) {
  const isEditing = !!unit;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? updateHealthUnitSchema : createHealthUnitSchema,
    ),
    defaultValues: isEditing
      ? {
          unitName: unit.unitName,
          unitType: unit.unitType,
          cnpj: maskCNPJ(unit.cnpj),
          phone: maskPhone(unit.phone),
          email: unit.email ?? "",
          observations: unit.observations ?? undefined,
          address: {
            zipCode: maskZipCode(unit.address.zipCode),
            street: unit.address.street,
            number: unit.address.number,
            complement: unit.address.complement ?? undefined,
            district: unit.address.district,
            city: unit.address.city,
            state: unit.address.state,
          },
        }
      : CREATE_DEFAULTS,
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateHealthUnit(unit.id, data as UpdateHealthUnitFormData)
          : createHealthUnit(data as CreateHealthUnitFormData),
      successMessage: isEditing
        ? "Unidade atualizada com sucesso"
        : "Unidade de saúde cadastrada com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(CREATE_DEFAULTS),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 ${isEditing ? "pb-2.5" : "pb-10"}`}
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Dados da unidade</SectionLabel>

        <Controller
          name="unitName"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Nome da unidade"
              placeholder={
                isEditing ? undefined : "Ex: Hospital Municipal de Mallet"
              }
              icon={BuildingIcon}
              error={errors.unitName?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="unitType"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Tipo"
                error={errors.unitType?.message}
                options={UNIT_TYPES.map((t) => ({
                  label: UNIT_TYPE_LABELS[t],
                  value: t,
                }))}
                value={field.value}
                onChange={field.onChange}
                variant={variant ?? "primary"}
              />
            )}
          />

          <Controller
            name="cnpj"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="CNPJ"
                placeholder={isEditing ? undefined : "00.000.000/0000-00"}
                error={errors.cnpj?.message}
                masks={[{ mask: "00.000.000/0000-00" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="Telefone"
                placeholder={isEditing ? undefined : "(00) 00000-0000"}
                icon={PhoneIcon}
                error={errors.phone?.message}
                masks={[
                  { mask: "(00) 0000-0000" },
                  { mask: "(00) 00000-0000" },
                ]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="E-mail"
                placeholder={isEditing ? undefined : "contato@unidade.com"}
                icon={MailIcon}
                error={errors.email?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="observations"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Observações"
              placeholder={isEditing ? undefined : "Observações relevantes..."}
              error={errors.observations?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SectionLabel>Endereço</SectionLabel>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <Controller
            name="address.zipCode"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="CEP"
                placeholder={isEditing ? undefined : "00000-000"}
                icon={MapPinIcon}
                error={errors.address?.zipCode?.message}
                masks={[{ mask: "00000-000" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="address.street"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Rua"
                placeholder={isEditing ? undefined : "Nome da rua"}
                icon={HomeIcon}
                error={errors.address?.street?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <Controller
            name="address.number"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Número"
                placeholder={isEditing ? undefined : "123"}
                icon={HashIcon}
                error={errors.address?.number?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="address.complement"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Complemento"
                placeholder={isEditing ? undefined : "Apto, Bloco..."}
                error={errors.address?.complement?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="address.district"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Bairro"
              placeholder={isEditing ? undefined : "Nome do bairro"}
              icon={MapIcon}
              error={errors.address?.district?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <Controller
            name="address.city"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Cidade"
                placeholder={isEditing ? undefined : "Mallet"}
                icon={BuildingIcon}
                error={errors.address?.city?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="address.state"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="UF"
                placeholder={isEditing ? undefined : "PR"}
                error={errors.address?.state?.message}
                masks={[{ mask: "AA" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label={isEditing ? "Salvar alterações" : "Cadastrar unidade"}
        icon={SaveIcon}
      />
    </Form>
  );
}
