"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TruckIcon, UserIcon } from "lucide-react";
import { InputNumberField } from "@/components/ui/input-number-field";
import { SelectField } from "@/components/ui/select-field";
import {
  transportReportFiltersSchema,
  TransportReportFilters,
} from "@/lib/schemas/transportReportFilters";
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
];

interface TransportReportFiltersPanelProps {
  filters: TransportReportFilters;
  vehicles: SelectOption[];
  drivers: SelectOption[];
  onApply: (filters: TransportReportFilters) => void;
  onClearOne: (key: keyof TransportReportFilters) => void;
  onClearAll: () => void;
}

export function TransportReportFiltersPanel({
  filters,
  vehicles,
  drivers,
  onApply,
  onClearOne,
  onClearAll,
}: TransportReportFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransportReportFilters>({
    resolver: zodResolver(transportReportFiltersSchema),
    defaultValues: {},
  });

  function applyFilters(data: TransportReportFilters) {
    onApply(data);
    setOpen(false);
  }

  const chips: FilterChip<TransportReportFilters>[] = [
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
    ...(filters.vehicleId
      ? [
          {
            label:
              vehicles.find((v) => v.value === filters.vehicleId)?.label ??
              "Veículo",
            key: "vehicleId" as const,
          },
        ]
      : []),
    ...(filters.driverId
      ? [
          {
            label:
              drivers.find((d) => d.value === filters.driverId)?.label ??
              "Motorista",
            key: "driverId" as const,
          },
        ]
      : []),
    ...(filters.minPassengers !== undefined
      ? [
          {
            label: `Mín ${filters.minPassengers} passageiros`,
            key: "minPassengers" as const,
          },
        ]
      : []),
    ...(filters.maxPassengers !== undefined
      ? [
          {
            label: `Máx ${filters.maxPassengers} passageiros`,
            key: "maxPassengers" as const,
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
      width={480}
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
          name="vehicleId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Veículo"
              icon={TruckIcon}
              options={vehicles}
              value={field.value ?? ""}
              onChange={(val) => field.onChange(val || undefined)}
              variant="secondary"
            />
          )}
        />

        <Controller
          name="driverId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Motorista"
              icon={UserIcon}
              options={drivers}
              value={field.value ?? ""}
              onChange={(val) => field.onChange(val || undefined)}
              variant="secondary"
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="minPassengers"
            control={control}
            render={({ field }) => (
              <InputNumberField
                label="Mín de passageiros"
                minValue={0}
                error={errors.minPassengers?.message}
                value={field.value}
                onChange={(val) => field.onChange(isNaN(val) ? undefined : val)}
                variant="secondary"
              />
            )}
          />
          <Controller
            name="maxPassengers"
            control={control}
            render={({ field }) => (
              <InputNumberField
                label="Máx de passageiros"
                minValue={0}
                error={errors.maxPassengers?.message}
                value={field.value}
                onChange={(val) => field.onChange(isNaN(val) ? undefined : val)}
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
