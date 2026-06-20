"use client";

import { useState, useCallback } from "react";
import {
  Button,
  Chip,
  SearchField,
  Table,
  useOverlayState,
} from "@heroui/react";
import { PencilIcon, XCircleIcon, CalendarIcon } from "lucide-react";
import { cancelAppointment, listAppointments } from "@/actions/appointment";
import type { AppointmentRow } from "@/actions/types/appointment";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { InputDateField } from "@/components/ui/input-date-field";
import { maskCPF } from "@/lib/utils/masks";
import { parseDate } from "@internationalized/date";
import CanceledInfo from "@/components/appointment/canceled-info";
import CancelForm from "@/components/forms/cancel-form";
import AppointmentForm from "@/components/forms/appointment-form";
import AppDrawer from "@/components/ui/app-drawer";
import { TablePagination } from "@/components/ui/table-pagination";

export default function Page() {
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<AppointmentRow | null>(null);
  const [drawerMode, setDrawerMode] = useState<"edit" | "cancel" | "canceled">(
    "edit",
  );

  const fetcher = useCallback(
    () => listAppointments(page, search, dateFilter, limit),
    [page, search, dateFilter, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const appointments = data?.success ? data.data.appointments : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(appointment: AppointmentRow) {
    setSelected(appointment);
    setDrawerMode("edit");
    drawerState.open();
  }

  function handleCancel(appointment: AppointmentRow) {
    setSelected(appointment);
    setDrawerMode("cancel");
    drawerState.open();
  }

  function handleViewCanceled(appointment: AppointmentRow) {
    setSelected(appointment);
    setDrawerMode("canceled");
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setSelected(null);
  }

  const isScaled = (appointment: AppointmentRow) =>
    appointment.transports.some((t) => !t.transport.isCanceled);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Agendamentos
          </h1>
          <p className="text-sm text-muted">
            Gerencie os agendamentos cadastrados
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <SearchField
          aria-label="Buscar paciente"
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="flex-1"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Buscar por nome do paciente" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <InputDateField
          label=""
          aria-label="Filtrar por data"
          variant="primary"
          icon={CalendarIcon}
          value={dateFilter ? parseDate(dateFilter) : null}
          onChange={(val) => {
            setDateFilter(val ? val.toString() : "");
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      <AsyncState
        data={appointments}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum agendamento encontrado
          </p>
        }
      >
        {(appointments) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de agendamentos">
                <Table.Header>
                  <Table.Column isRowHeader>Paciente</Table.Column>
                  <Table.Column>Data</Table.Column>
                  <Table.Column>Horário</Table.Column>
                  <Table.Column>Especialidade</Table.Column>
                  <Table.Column>Unidade</Table.Column>
                  <Table.Column>Local de espera</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {appointments.map((appointment) => (
                    <Table.Row key={appointment.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span
                            className={[
                              "text-sm font-medium",
                              appointment.isCanceled
                                ? "text-muted line-through"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {appointment.patient.name}
                          </span>
                          <span className="text-xs text-muted font-mono">
                            {maskCPF(appointment.patient.cpf)}
                          </span>
                          {appointment.hasCompanion &&
                            appointment.companion && (
                              <span className="text-xs text-muted">
                                + {appointment.companion.name}
                              </span>
                            )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {new Date(appointment.date).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" },
                          )}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {appointment.time}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {appointment.healthSpecialty.name}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {appointment.healthUnit.unitName}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {appointment.waitingPlace.name}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        {appointment.isCanceled ? (
                          <Chip size="sm" color="danger">
                            Cancelado
                          </Chip>
                        ) : isScaled(appointment) ? (
                          <Chip size="sm" color="success">
                            Escalado
                          </Chip>
                        ) : (
                          <Chip size="sm" color="warning">
                            Pendente
                          </Chip>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          {appointment.isCanceled ? (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              aria-label="Ver cancelamento"
                              onPress={() => handleViewCanceled(appointment)}
                              className="text-muted hover:bg-default"
                            >
                              <XCircleIcon size={14} />
                            </Button>
                          ) : (
                            <>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Editar"
                                onPress={() => handleEdit(appointment)}
                              >
                                <PencilIcon size={14} />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Cancelar"
                                onPress={() => handleCancel(appointment)}
                                className="text-danger hover:bg-danger/10"
                              >
                                <XCircleIcon size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>

            <Table.Footer>
              <TablePagination
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
              />
            </Table.Footer>
          </Table>
        )}
      </AsyncState>

      <AppDrawer state={drawerState}>
        {selected && drawerMode === "edit" && (
          <AppointmentForm
            appointment={selected}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
          />
        )}
        {selected && drawerMode === "cancel" && (
          <CancelForm
            onCancel={(data) => cancelAppointment(selected.id, data)}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
            successMessage="Agendamento cancelado"
          />
        )}
        {selected && drawerMode === "canceled" && (
          <CanceledInfo appointment={selected} />
        )}
      </AppDrawer>
    </div>
  );
}
