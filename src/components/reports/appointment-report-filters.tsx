"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StethoscopeIcon,
  BuildingIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import {
  appointmentReportFiltersSchema,
  AppointmentReportFilters,
} from "@/lib/schemas/appointmentReportFilters";
import {
  FilterPanelBase,
  ActiveFilters,
  FilterChip,
} from "@/components/reports/filter-panel-base";
import { FilterDateStatusRow } from "@/components/reports/filter-date-status-row";

type SelectOption = { label: string; value: string };

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos", value: "" },
  { label: "Ativos", value: "active" },
  { label: "Cancelados", value: "canceled" },
  { label: "Pendentes", value: "pending" },
  { label: "Escalados", value: "escalated" },
];

const COMPANION_OPTIONS: SelectOption[] = [
  { label: "Todos", value: "" },
  { label: "Com acompanhante", value: "true" },
  { label: "Sem acompanhante", value: "false" },
];

interface AppointmentReportFiltersPanelProps {
  filters: AppointmentReportFilters;
  specialties: SelectOption[];
  healthUnits: SelectOption[];
  waitingPlaces: SelectOption[];
  users: SelectOption[];
  onApply: (filters: AppointmentReportFilters) => void;
  onClearOne: (key: keyof AppointmentReportFilters) => void;
  onClearAll: () => void;
}

export function AppointmentReportFiltersPanel({
  filters,
  specialties,
  healthUnits,
  waitingPlaces,
  users,
  onApply,
  onClearOne,
  onClearAll,
}: AppointmentReportFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentReportFilters>({
    resolver: zodResolver(appointmentReportFiltersSchema),
    defaultValues: {},
  });

  function applyFilters(data: AppointmentReportFilters) {
    onApply(data);
    setOpen(false);
  }

  const chips: FilterChip<AppointmentReportFilters>[] = [
    ...(filters.dateFrom
      ? [
          {
            label: `De ${new Date(`${filters.dateFrom}T00:00:00.000Z`).toLocaleDateString("pt-BR")}`,
            key: "dateFrom" as const,
          },
        ]
      : []),
    ...(filters.dateTo
      ? [
          {
            label: `Até ${new Date(`${filters.dateTo}T00:00:00.000Z`).toLocaleDateString("pt-BR")}`,
            key: "dateTo" as const,
          },
        ]
      : []),
    ...(filters.search
      ? [{ label: `"${filters.search}"`, key: "search" as const }]
      : []),
    ...(filters.status
      ? [
          {
            label:
              STATUS_OPTIONS.find((s) => s.value === filters.status)?.label ??
              filters.status,
            key: "status" as const,
          },
        ]
      : []),
    ...(filters.specialtyId
      ? [
          {
            label:
              specialties.find((s) => s.value === filters.specialtyId)?.label ??
              "Especialidade",
            key: "specialtyId" as const,
          },
        ]
      : []),
    ...(filters.healthUnitId
      ? [
          {
            label:
              healthUnits.find((u) => u.value === filters.healthUnitId)
                ?.label ?? "Unidade",
            key: "healthUnitId" as const,
          },
        ]
      : []),
    ...(filters.waitingPlaceId
      ? [
          {
            label:
              waitingPlaces.find((w) => w.value === filters.waitingPlaceId)
                ?.label ?? "Local de espera",
            key: "waitingPlaceId" as const,
          },
        ]
      : []),
    ...(filters.hasCompanion !== undefined
      ? [
          {
            label: filters.hasCompanion
              ? "Com acompanhante"
              : "Sem acompanhante",
            key: "hasCompanion" as const,
          },
        ]
      : []),
    ...(filters.createdById
      ? [
          {
            label:
              users.find((u) => u.value === filters.createdById)?.label ??
              "Usuário",
            key: "createdById" as const,
          },
        ]
      : []),
  ];

  return (
    <FilterPanelBase
      hasFilters={Object.keys(filters).length > 0}
      open={open}
      onOpenChange={(v) => {
        if (!v) reset(filters);
        setOpen(v);
      }}
      onClearAll={onClearAll}
      width={700}
      activeFilters={<ActiveFilters chips={chips} onClear={onClearOne} />}
    >
      <form
        onSubmit={handleSubmit(applyFilters)}
        className="w-full flex flex-col gap-4 px-2 py-4"
      >
        <FilterDateStatusRow
          control={control}
          errors={errors}
          statusOptions={STATUS_OPTIONS}
        />

        <Controller
          name="healthUnitId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Unidade de saúde"
              icon={BuildingIcon}
              options={healthUnits}
              value={field.value ?? ""}
              onChange={(val) => field.onChange(val || undefined)}
              variant="secondary"
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="waitingPlaceId"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Local de espera"
                icon={MapPinIcon}
                options={waitingPlaces}
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val || undefined)}
                variant="secondary"
              />
            )}
          />
          <Controller
            name="specialtyId"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Especialidade"
                icon={StethoscopeIcon}
                options={specialties}
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val || undefined)}
                variant="secondary"
              />
            )}
          />
          <Controller
            name="hasCompanion"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Acompanhante"
                options={COMPANION_OPTIONS}
                value={field.value === undefined ? "" : String(field.value)}
                onChange={(val) =>
                  field.onChange(val === "" ? undefined : val === "true")
                }
                variant="secondary"
              />
            )}
          />
          <Controller
            name="createdById"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Criado por"
                icon={UserIcon}
                options={users}
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val || undefined)}
                variant="secondary"
              />
            )}
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onPress={() => reset({})}
          >
            Limpar
          </Button>
          <Button size="sm" type="submit">
            Aplicar filtros
          </Button>
        </div>
      </form>
    </FilterPanelBase>
  );
}
