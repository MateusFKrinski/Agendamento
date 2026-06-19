"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTransportSchema,
  type CreateTransportFormData,
} from "@/lib/schemas/transport";
import {
  createTransport,
  getTransportById,
  listPendingAppointments,
  listTransportsByDate,
} from "@/actions/transport";
import { listVehicles } from "@/actions/vehicle";
import { listDrivers } from "@/actions/driver";
import { Button, Form, Separator, toast, useOverlayState } from "@heroui/react";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  SaveIcon,
  UsersIcon,
} from "lucide-react";
import { InputDateField } from "@/components/ui/input-date-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import { SearchSelectField } from "@/components/ui/search-select-field";
import ButtonField from "@/components/ui/button-field";
import AppDrawer from "@/components/ui/app-drawer";
import AddAppointmentsForm from "@/components/forms/add-appointments-form";
import { formSubmit } from "@/lib/form-submit";
import { parseDate } from "@internationalized/date";
import type {
  PendingAppointmentRow,
  TransportRow,
  TransportSummaryRow,
} from "@/actions/types/transport";
import { AppointmentCheckboxList } from "@/components/transport/appointment-checkbox-list";
import SectionLabel from "@/components/ui/section-label";
import { maskPlate } from "@/lib/utils/masks";
import { countPassengers } from "@/lib/utils/count-passengers";

type VehicleOption = {
  label: string;
  value: string;
  description: string;
  capacity: number;
};

const DEFAULT_VALUES: CreateTransportFormData = {
  date: "",
  departureTime: "",
  vehicleId: "",
  driverId: "",
  appointmentIds: [],
};

export default function TransportForm() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [appointments, setAppointments] = useState<PendingAppointmentRow[]>([]);
  const [existingTransports, setExistingTransports] = useState<
    TransportSummaryRow[]
  >([]);
  const [vehicleCapacity, setVehicleCapacity] = useState(0);

  const addDrawer = useOverlayState({ defaultOpen: false });
  const [selectedTransport, setSelectedTransport] =
    useState<TransportRow | null>(null);
  const [loadingTransportId, setLoadingTransportId] = useState<string | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransportFormData>({
    resolver: zodResolver(createTransportSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedDate = watch("date");
  const selectedVehicleId = watch("vehicleId");

  useEffect(() => {
    async function load() {
      const [vResult, dResult] = await Promise.all([
        listVehicles(1, "", 999),
        listDrivers(1, "", 999),
      ]);
      if (vResult.success)
        setVehicles(
          vResult.data.vehicles.map((v) => ({
            label: `${maskPlate(v.plate)} — ${v.brand} ${v.model}`,
            value: v.id,
            description: `${v.capacity - 1} vagas disponíveis`,
            capacity: v.capacity,
          })),
        );
      if (dResult.success)
        setDrivers(
          dResult.data.drivers.map((d) => ({ label: d.name, value: d.id })),
        );
    }
    load().then();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setAppointments([]);
      setExistingTransports([]);
      setValue("appointmentIds", []);
      return;
    }
    async function loadForDate() {
      const [appointmentsResult, transportsResult] = await Promise.all([
        listPendingAppointments(selectedDate),
        listTransportsByDate(selectedDate),
      ]);
      if (appointmentsResult.success)
        setAppointments(appointmentsResult.data.appointments);
      if (transportsResult.success)
        setExistingTransports(transportsResult.data.transports);
      setValue("appointmentIds", []);
    }
    loadForDate().then();
  }, [selectedDate, setValue]);

  async function reloadForDate() {
    if (!selectedDate) return;
    const [appointmentsResult, transportsResult] = await Promise.all([
      listPendingAppointments(selectedDate),
      listTransportsByDate(selectedDate),
    ]);
    if (appointmentsResult.success)
      setAppointments(appointmentsResult.data.appointments);
    if (transportsResult.success)
      setExistingTransports(transportsResult.data.transports);
  }

  useEffect(() => {
    const vehicle = vehicles.find((v) => v.value === selectedVehicleId);
    setVehicleCapacity(vehicle ? vehicle.capacity - 1 : 0);
  }, [selectedVehicleId, vehicles]);

  const selectedIds = watch("appointmentIds");

  const selectedPassengers = countPassengers(
    appointments
      .filter((a) => selectedIds.includes(a.id))
      .map((a) => ({
        patientId: a.patient.id,
        hasCompanion: a.hasCompanion,
        companionId: a.companion?.id ?? null,
      })),
  );

  const remainingSeats = vehicleCapacity - selectedPassengers;

  async function handleAddToExisting(transportId: string) {
    setLoadingTransportId(transportId);
    const result = await getTransportById(transportId);
    setLoadingTransportId(null);

    if (result.success) {
      setSelectedTransport(result.data.transport);
      addDrawer.open();
    } else {
      toast.danger(result.error);
    }
  }

  async function onSubmit(data: CreateTransportFormData) {
    await formSubmit({
      action: () => createTransport(data),
      successMessage: "Transporte criado com sucesso",
      onSuccess: () => reset(DEFAULT_VALUES),
    });
  }

  return (
    <>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 pb-10"
      >
        <div className="flex flex-col gap-3">
          <SectionLabel>Data e horário</SectionLabel>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <InputDateField
                  variant="primary"
                  label="Data"
                  icon={CalendarIcon}
                  error={errors.date?.message}
                  value={field.value ? parseDate(field.value) : null}
                  onChange={(val) => field.onChange(val ? val.toString() : "")}
                />
              )}
            />

            <Controller
              name="departureTime"
              control={control}
              render={({ field }) => (
                <InputMaskField
                  variant="primary"
                  label="Horário"
                  placeholder="08:00"
                  icon={ClockIcon}
                  error={errors.departureTime?.message}
                  masks={[{ mask: "00:00" }]}
                  autoComplete="off"
                  {...field}
                />
              )}
            />
          </div>
        </div>

        {existingTransports.length > 0 && (
          <>
            <Separator />

            <div className="flex flex-col gap-3">
              <SectionLabel>Transportes já criados para essa data</SectionLabel>

              <div className="flex flex-col gap-2">
                {existingTransports.map((transport) => {
                  const occupied = countPassengers(
                    transport.appointments.map((a) => ({
                      patientId: a.appointment.patientId,
                      hasCompanion: a.appointment.hasCompanion,
                      companionId: a.appointment.companionId,
                    })),
                  );
                  const seats = transport.vehicle.capacity - 1;
                  const isFull = occupied >= seats;

                  return (
                    <div
                      key={transport.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-default"
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">
                          {maskPlate(transport.vehicle.plate)} —{" "}
                          {transport.vehicle.brand} {transport.vehicle.model}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>{transport.driver.name}</span>
                          <span>{transport.departureTime}</span>
                          <span className="flex items-center gap-1">
                            <UsersIcon size={11} />
                            <span
                              className={
                                isFull
                                  ? "text-danger font-medium"
                                  : "font-medium"
                              }
                            >
                              {occupied}
                            </span>
                            /{seats} vagas
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        isDisabled={isFull || loadingTransportId !== null}
                        onPress={() => handleAddToExisting(transport.id)}
                        className="text-accent hover:bg-accent/10 shrink-0"
                      >
                        <PlusIcon size={14} />
                        {loadingTransportId === transport.id
                          ? "Abrindo..."
                          : "Adicionar agendamentos"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-3">
          <SectionLabel>Veículo e motorista</SectionLabel>

          <Controller
            name="vehicleId"
            control={control}
            render={({ field }) => (
              <SearchSelectField
                label="Veículo"
                placeholder="Buscar veículo..."
                error={errors.vehicleId?.message}
                options={vehicles}
                value={field.value}
                onChangeAction={field.onChange}
              />
            )}
          />

          <Controller
            name="driverId"
            control={control}
            render={({ field }) => (
              <SearchSelectField
                label="Motorista"
                placeholder="Buscar motorista..."
                error={errors.driverId?.message}
                options={drivers}
                value={field.value}
                onChangeAction={field.onChange}
              />
            )}
          />

          {selectedVehicleId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default">
              <UsersIcon size={14} className="text-muted shrink-0" />
              <span className="text-xs text-muted">
                {remainingSeats >= 0 ? (
                  <>
                    <span
                      className={[
                        "font-medium",
                        remainingSeats === 0
                          ? "text-danger"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {remainingSeats}
                    </span>{" "}
                    vagas restantes de {vehicleCapacity} disponíveis
                  </>
                ) : (
                  <span className="text-danger font-medium">
                    Capacidade excedida em {Math.abs(remainingSeats)} passageiro
                    {Math.abs(remainingSeats) !== 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <SectionLabel>
            {appointments.length > 0
              ? `Agendamentos pendentes — ${appointments.length} encontrado${appointments.length !== 1 ? "s" : ""}`
              : "Agendamentos pendentes"}
          </SectionLabel>

          {!selectedDate && (
            <p className="text-xs text-muted text-center py-4">
              Selecione uma data para ver os agendamentos pendentes
            </p>
          )}

          {selectedDate && appointments.length === 0 && (
            <p className="text-xs text-muted text-center py-4">
              Nenhum agendamento pendente para essa data
            </p>
          )}

          {errors.appointmentIds?.message && (
            <p className="text-xs text-danger">
              {errors.appointmentIds.message}
            </p>
          )}

          {appointments.length > 0 && (
            <Controller
              name="appointmentIds"
              control={control}
              render={({ field }) => (
                <AppointmentCheckboxList
                  appointments={appointments}
                  value={field.value}
                  onChange={field.onChange}
                  remainingSeats={remainingSeats}
                  hasVehicle={!!selectedVehicleId}
                />
              )}
            />
          )}
        </div>

        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Criar transporte"
          icon={SaveIcon}
        />
      </Form>

      <AppDrawer state={addDrawer}>
        {selectedTransport && (
          <AddAppointmentsForm
            transport={selectedTransport}
            afterSubmitAction={() => {
              addDrawer.close();
              setSelectedTransport(null);
              reloadForDate().then();
            }}
          />
        )}
      </AppDrawer>
    </>
  );
}
