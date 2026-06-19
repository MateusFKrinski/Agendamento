"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  type CreateAppointmentFormData,
  type UpdateAppointmentFormData,
} from "@/lib/schemas/appointment";
import { createAppointment, updateAppointment } from "@/actions/appointment";
import { Form, Label, Switch, Separator } from "@heroui/react";
import { CalendarIcon, SaveIcon, ClockIcon } from "lucide-react";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputDateField } from "@/components/ui/input-date-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { SearchSelectField } from "@/components/ui/search-select-field";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { parseDate } from "@internationalized/date";
import { listAllWaitingPlaces } from "@/actions/waitingPlace";
import { listHealthSpecialties } from "@/actions/healthSpecialty";
import { listHealthUnits } from "@/actions/healthUnit";
import { listPeople } from "@/actions/person";
import { UNIT_TYPE_LABELS } from "@/lib/schemas/healthUnit";
import { maskCPF } from "@/lib/utils/masks";
import type { AppointmentRow } from "@/actions/types/appointment";
import SectionLabel from "@/components/ui/section-label";

type SelectOption = { label: string; value: string; description?: string };

type FormData = CreateAppointmentFormData | UpdateAppointmentFormData;

const CREATE_DEFAULTS: CreateAppointmentFormData = {
  date: "",
  time: "",
  patientId: "",
  hasCompanion: false,
  companionId: undefined,
  healthSpecialtyId: "",
  healthUnitId: "",
  waitingPlaceId: "",
  observations: undefined,
};

interface AppointmentFormProps {
  appointment?: AppointmentRow;
  afterSubmitAction?: () => void;
}

export default function AppointmentForm({
  appointment,
  afterSubmitAction,
}: AppointmentFormProps) {
  const isEditing = !!appointment;
  const variant = isEditing ? "secondary" : "primary";

  const [patients, setPatients] = useState<SelectOption[]>([]);
  const [specialties, setSpecialties] = useState<SelectOption[]>([]);
  const [healthUnits, setHealthUnits] = useState<SelectOption[]>([]);
  const [waitingPlaces, setWaitingPlaces] = useState<SelectOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const [pResult, sResult, hResult, wResult] = await Promise.all([
        listPeople(1, "", 999),
        listHealthSpecialties(1, "", 999),
        listHealthUnits(1, "", 999),
        listAllWaitingPlaces(),
      ]);

      if (pResult.success)
        setPatients(
          pResult.data.people.map((p) => ({
            label: p.name,
            value: p.id,
            description: maskCPF(p.cpf),
          })),
        );
      if (sResult.success)
        setSpecialties(
          sResult.data.specialties.map((s) => ({ label: s.name, value: s.id })),
        );
      if (hResult.success)
        setHealthUnits(
          hResult.data.units.map((u) => ({
            label: u.unitName,
            value: u.id,
            description: `${u.address.city} — ${UNIT_TYPE_LABELS[u.unitType]}`,
          })),
        );
      if (wResult.success)
        setWaitingPlaces(
          wResult.data.waitingPlaces.map((w) => ({
            label: w.name,
            value: w.id,
          })),
        );
    }

    loadOptions().then();
  }, []);

  const editDefaults: UpdateAppointmentFormData = appointment
    ? {
        date: new Date(appointment.date).toISOString().split("T")[0],
        time: appointment.time,
        patientId: appointment.patient.id,
        hasCompanion: appointment.hasCompanion,
        companionId: appointment.companion?.id ?? undefined,
        healthSpecialtyId: appointment.healthSpecialty.id,
        healthUnitId: appointment.healthUnit.id,
        waitingPlaceId: appointment.waitingPlace.id,
        observations: appointment.observations ?? undefined,
      }
    : (undefined as never);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? updateAppointmentSchema : createAppointmentSchema,
    ),
    defaultValues: isEditing ? editDefaults : CREATE_DEFAULTS,
  });

  const hasCompanion = watch("hasCompanion");
  const patientId = watch("patientId");
  const companionOptions = patients.filter((p) => p.value !== patientId);

  async function onSubmit(data: FormData) {
    await formSubmit({
      action: () =>
        isEditing
          ? updateAppointment(appointment.id, data as UpdateAppointmentFormData)
          : createAppointment(data as CreateAppointmentFormData),
      successMessage: isEditing
        ? "Agendamento atualizado com sucesso"
        : "Agendamento criado com sucesso",
      onSuccess: isEditing ? afterSubmitAction : () => reset(CREATE_DEFAULTS),
    });
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-6 ${!isEditing && "pb-10"}`}
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Consulta</SectionLabel>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <InputDateField
                variant={variant}
                label="Data"
                icon={CalendarIcon}
                error={errors.date?.message}
                value={field.value ? parseDate(field.value) : null}
                onChange={(val) => field.onChange(val ? val.toString() : "")}
              />
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <InputMaskField
                variant={variant}
                label="Horário"
                placeholder="08:00"
                icon={ClockIcon}
                error={errors.time?.message}
                masks={[{ mask: "00:00" }]}
                autoComplete="off"
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="healthSpecialtyId"
          control={control}
          render={({ field }) => (
            <SearchSelectField
              variant={variant}
              label="Especialidade"
              placeholder="Buscar especialidade..."
              error={errors.healthSpecialtyId?.message}
              options={specialties}
              value={field.value}
              onChangeAction={field.onChange}
            />
          )}
        />

        <Controller
          name="healthUnitId"
          control={control}
          render={({ field }) => (
            <SearchSelectField
              variant={variant}
              label="Unidade de saúde"
              placeholder="Buscar unidade..."
              error={errors.healthUnitId?.message}
              options={healthUnits}
              value={field.value}
              onChangeAction={field.onChange}
            />
          )}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SectionLabel>Paciente</SectionLabel>

        <Controller
          name="patientId"
          control={control}
          render={({ field }) => (
            <SearchSelectField
              variant={variant}
              label="Paciente"
              placeholder="Buscar paciente..."
              error={errors.patientId?.message}
              options={patients}
              value={field.value}
              onChangeAction={field.onChange}
            />
          )}
        />

        <Controller
          name="waitingPlaceId"
          control={control}
          render={({ field }) => (
            <SearchSelectField
              variant={variant}
              label="Local de espera"
              placeholder="Buscar local..."
              error={errors.waitingPlaceId?.message}
              options={waitingPlaces}
              value={field.value}
              onChangeAction={field.onChange}
            />
          )}
        />

        <Controller
          name="hasCompanion"
          control={control}
          render={({ field }) => (
            <Switch isSelected={field.value} onChange={field.onChange}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                <Label>Possui acompanhante</Label>
              </Switch.Content>
            </Switch>
          )}
        />

        {hasCompanion && (
          <Controller
            name="companionId"
            control={control}
            render={({ field }) => (
              <SearchSelectField
                variant={variant}
                label="Acompanhante"
                placeholder="Buscar acompanhante..."
                error={errors.companionId?.message}
                options={companionOptions}
                value={field.value}
                onChangeAction={field.onChange}
              />
            )}
          />
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SectionLabel>Observações</SectionLabel>

        <Controller
          name="observations"
          control={control}
          render={({ field }) => (
            <InputTextField
              variant={variant}
              label="Observações"
              placeholder="Observações relevantes..."
              error={errors.observations?.message}
              autoComplete="off"
              {...field}
            />
          )}
        />
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label={isEditing ? "Salvar alterações" : "Criar agendamento"}
        icon={SaveIcon}
      />
    </Form>
  );
}
