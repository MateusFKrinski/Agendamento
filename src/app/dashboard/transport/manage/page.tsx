"use client";

import { useState, useCallback } from "react";
import { Button, Chip, Table, useOverlayState } from "@heroui/react";
import { XCircleIcon, CalendarIcon, PlusIcon, PencilIcon } from "lucide-react";
import { listTransports, cancelTransport } from "@/actions/transport";
import type { TransportRow } from "@/actions/types/transport";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { InputDateField } from "@/components/ui/input-date-field";
import { TablePagination } from "@/components/ui/table-pagination";
import { parseDate } from "@internationalized/date";
import { maskPlate } from "@/lib/utils/masks";
import AppDrawer from "@/components/ui/app-drawer";
import CancelForm from "@/components/forms/cancel-form";
import TransportDetails from "@/components/transport/transport-details";
import AddAppointmentsForm from "@/components/forms/add-appointments-form";
import TransportEditForm from "@/components/forms/transport-edit-form";
import { countPassengers } from "@/lib/utils/count-passengers";

export default function Page() {
  const drawerState = useOverlayState({ defaultOpen: false });
  const { page, setPage, limit, handleLimitChange } = usePagination(10);

  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<TransportRow | null>(null);
  const [drawerMode, setDrawerMode] = useState<
    "details" | "add" | "cancel" | "edit"
  >("details");

  const fetcher = useCallback(
    () => listTransports(page, dateFilter, limit),
    [page, dateFilter, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const transports = data?.success ? data.data.transports : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleDetails(transport: TransportRow) {
    setSelected(transport);
    setDrawerMode("details");
    drawerState.open();
  }

  function handleAdd(transport: TransportRow) {
    setSelected(transport);
    setDrawerMode("add");
    drawerState.open();
  }

  function handleEdit(transport: TransportRow) {
    setSelected(transport);
    setDrawerMode("edit");
    drawerState.open();
  }

  function handleCancel(transport: TransportRow) {
    setSelected(transport);
    setDrawerMode("cancel");
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setSelected(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Transportes</h1>
        <p className="text-sm text-muted">
          Gerencie os transportes cadastrados
        </p>
      </div>

      <div className="w-full flex justify-end">
        <InputDateField
          label=""
          variant="primary"
          icon={CalendarIcon}
          aria-label="Filtrar por data"
          value={dateFilter ? parseDate(dateFilter) : null}
          onChange={(val) => {
            setDateFilter(val ? val.toString() : "");
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      <AsyncState
        data={transports}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum transporte encontrado
          </p>
        }
      >
        {(transports) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de transportes">
                <Table.Header>
                  <Table.Column isRowHeader>Data</Table.Column>
                  <Table.Column>Saída</Table.Column>
                  <Table.Column>Veículo</Table.Column>
                  <Table.Column>Motorista</Table.Column>
                  <Table.Column className="text-center">
                    Passageiros
                  </Table.Column>
                  <Table.Column className="text-center">Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {transports.map((transport) => {
                    const totalPassengers = countPassengers(
                      transport.appointments.map((a) => ({
                        patientId: a.appointment.patient.id,
                        hasCompanion: a.appointment.hasCompanion,
                        companionId: a.appointment.companion?.id ?? null,
                      })),
                    );
                    const availableSeats = transport.vehicle.capacity - 1;

                    return (
                      <Table.Row key={transport.id}>
                        <Table.Cell>
                          <span className="text-sm text-foreground">
                            {new Date(transport.date).toLocaleDateString(
                              "pt-BR",
                              { timeZone: "UTC" },
                            )}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-sm text-muted">
                            {transport.departureTime}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex flex-col">
                            <span className="text-sm font-mono text-foreground">
                              {maskPlate(transport.vehicle.plate)}
                            </span>
                            <span className="text-xs text-muted">
                              {transport.vehicle.brand}{" "}
                              {transport.vehicle.model}
                            </span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-sm text-muted">
                            {transport.driver.name}
                          </span>
                        </Table.Cell>

                        <Table.Cell className="text-center">
                          <span
                            className={[
                              "text-sm font-medium",
                              totalPassengers >= availableSeats
                                ? "text-danger"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {totalPassengers}/{availableSeats}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="w-full flex justify-center">
                            <Chip
                              size="sm"
                              color={
                                transport.isCanceled ? "danger" : "success"
                              }
                            >
                              {transport.isCanceled ? "Cancelado" : "Ativo"}
                            </Chip>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1 justify-end">
                            {!transport.isCanceled && (
                              <>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Adicionar agendamentos"
                                  onPress={() => handleAdd(transport)}
                                  className="text-accent hover:bg-accent/10"
                                >
                                  <PlusIcon size={14} />
                                </Button>

                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Editar"
                                  onPress={() => handleEdit(transport)}
                                  className="text-foreground hover:bg-default"
                                >
                                  <PencilIcon size={14} />
                                </Button>

                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Cancelar"
                                  onPress={() => handleCancel(transport)}
                                  className="text-danger hover:bg-danger/10"
                                >
                                  <XCircleIcon size={14} />
                                </Button>
                              </>
                            )}

                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              aria-label="Ver detalhes"
                              onPress={() => handleDetails(transport)}
                            >
                              <CalendarIcon size={14} />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
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
        {selected && drawerMode === "details" && (
          <TransportDetails
            transport={selected}
            afterRemoveAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
          />
        )}
        {selected && drawerMode === "add" && (
          <AddAppointmentsForm
            transport={selected}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
          />
        )}
        {selected && drawerMode === "edit" && (
          <TransportEditForm
            transport={selected}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
          />
        )}
        {selected && drawerMode === "cancel" && (
          <CancelForm
            onCancel={(data) => cancelTransport(selected.id, data)}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
            successMessage="Transporte cancelado"
          />
        )}
      </AppDrawer>
    </div>
  );
}
