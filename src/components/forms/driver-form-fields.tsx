"use client";

import { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Separator } from "@heroui/react";
import {
  UserIcon,
  PhoneIcon,
  FileTextIcon,
  CalendarIcon,
  IdCardIcon,
} from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { InputDateField } from "@/components/ui/input-date-field";
import { SelectField } from "@/components/ui/select-field";
import { parseDate } from "@internationalized/date";
import { CNH_CATEGORIES } from "@/lib/schemas/fields/cnhCategorySchema";
import { DriverBaseFormData } from "@/lib/schemas/driver";
import SectionLabel from "@/components/ui/section-label";

type DriverFormData = DriverBaseFormData;

interface DriverFormFieldsProps {
  control: Control<DriverFormData>;
  errors: FieldErrors<DriverFormData>;
  variant?: "primary" | "secondary";
}

export function DriverFormFields({
  control,
  errors,
  variant = "primary",
}: DriverFormFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <SectionLabel>Dados pessoais</SectionLabel>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Nome completo"
              placeholder="Fulano de Tal"
              icon={UserIcon}
              error={errors.name?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="CPF"
                placeholder="000.000.000-00"
                icon={FileTextIcon}
                error={errors.cpf?.message}
                masks={[{ mask: "000.000.000-00" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <InputDateField
                label="Data de nascimento"
                icon={CalendarIcon}
                error={errors.birthDate?.message}
                value={field.value ? parseDate(field.value) : null}
                onChange={(val) => field.onChange(val ? val.toString() : "")}
                variant={variant}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="rg"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="RG"
                placeholder="00.000.000-0"
                icon={FileTextIcon}
                error={errors.rg?.message}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <InputTextField
                label="Cargo/função"
                placeholder="Motorista"
                icon={UserIcon}
                error={errors.role?.message}
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <InputMaskField
              label="Telefone"
              placeholder="(00) 00000-0000"
              icon={PhoneIcon}
              error={errors.phone?.message}
              masks={[{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }]}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <Controller
          name="observations"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Observações"
              placeholder="Observações relevantes..."
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
        <SectionLabel>Carteira de habilitação</SectionLabel>

        <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <Controller
            name="cnhNumber"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="Número da CNH"
                placeholder="00000000000"
                icon={IdCardIcon}
                error={errors.cnhNumber?.message}
                masks={[{ mask: "00000000000" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />

          <Controller
            name="cnhCategory"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Categoria"
                error={errors.cnhCategory?.message}
                options={CNH_CATEGORIES.map((c) => ({ label: c, value: c }))}
                value={field.value}
                onChange={field.onChange}
                variant={variant ?? "primary"}
              />
            )}
          />
        </div>

        <Controller
          name="cnhExpiration"
          control={control}
          render={({ field }) => (
            <InputDateField
              label="Validade da CNH"
              icon={CalendarIcon}
              error={errors.cnhExpiration?.message}
              value={field.value ? parseDate(field.value) : null}
              onChange={(val) => field.onChange(val ? val.toString() : "")}
              variant={variant}
            />
          )}
        />
      </div>
    </>
  );
}
