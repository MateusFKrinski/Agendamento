"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPersonSchema,
  updatePersonSchema,
  type CreatePersonFormData,
  type UpdatePersonFormData,
} from "@/lib/schemas/person";
import { createPerson, updatePerson } from "@/actions/person";
import type { PersonRow } from "@/actions/types/person";
import { Form, Separator } from "@heroui/react";
import {
  UserIcon,
  PhoneIcon,
  FileTextIcon,
  MapPinIcon,
  HomeIcon,
  HashIcon,
  MapIcon,
  BuildingIcon,
  SaveIcon,
  CalendarIcon,
} from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { InputDateField } from "@/components/ui/input-date-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { parseDate } from "@internationalized/date";
import { maskCPF, maskPhone, maskZipCode } from "@/lib/utils/masks";
import SectionLabel from "@/components/ui/section-label";

type FormData = CreatePersonFormData | UpdatePersonFormData;

const CREATE_DEFAULTS: CreatePersonFormData = {
  name: "",
  cpf: "",
  birthDate: "",
  phone: "",
  observations: "",
  address: {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "Mallet",
    state: "PR",
  },
};

interface PersonFormProps {
  person?: PersonRow;
  afterSubmitAction?: () => void;
}

export default function PersonForm({
  person,
  afterSubmitAction,
}: PersonFormProps) {
  const isEditing = !!person;
  const variant = isEditing ? "secondary" : "primary";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updatePersonSchema : createPersonSchema),
    defaultValues: isEditing
      ? {
          name: person.name,
          cpf: maskCPF(person.cpf),
          birthDate: person.birthDate.toISOString().split("T")[0],
          phone: maskPhone(person.phone),
          observations: person.observations ?? undefined,
          address: {
            zipCode: maskZipCode(person.address.zipCode),
            street: person.address.street,
            number: person.address.number,
            complement: person.address.complement ?? undefined,
            district: person.address.district,
            city: person.address.city,
            state: person.address.state,
          },
        }
      : CREATE_DEFAULTS,
  });

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updatePerson(person.id, data as UpdatePersonFormData)
          : createPerson(data as CreatePersonFormData),
      successMessage: isEditing
        ? "Pessoa atualizada com sucesso"
        : "Pessoa cadastrada com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 ${isEditing ? "pb-2.5" : ""}`}
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Dados pessoais</SectionLabel>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Nome completo"
              placeholder={isEditing ? undefined : "Fulano de Tal"}
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
                placeholder={isEditing ? undefined : "000.000.000-00"}
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

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <InputMaskField
              label="Telefone"
              placeholder={isEditing ? undefined : "(00) 00000-0000"}
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
                masks={[{ mask: "aa" }]}
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
        label={isEditing ? "Salvar alterações" : "Cadastrar pessoa"}
        icon={SaveIcon}
      />
    </Form>
  );
}
