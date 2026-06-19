"use client";

import { useState, useCallback, useEffect } from "react";
import { Chip, Table } from "@heroui/react";
import { listTransportReport } from "@/actions/reports";
import { listVehicles } from "@/actions/vehicle";
import { listDrivers } from "@/actions/driver";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { maskPlate } from "@/lib/utils/masks";
import { TransportReportFilters } from "@/lib/schemas/transportReportFilters";
import { TransportReportFiltersPanel } from "@/components/reports/transport-report-filters";
import { countPassengers } from "@/lib/utils/count-passengers";

type SelectOption = { label: string; value: string };

export default function Page() {
  const { page, setPage, limit, handleLimitChange } = usePagination(20);
  const [filters, setFilters] = useState<TransportReportFilters>({});

  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [drivers, setDrivers] = useState<SelectOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const [vResult, dResult] = await Promise.all([
        listVehicles(1, "", 999),
        listDrivers(1, "", 999),
      ]);
      if (vResult.success)
        setVehicles([
          { label: "Todos", value: "" },
          ...vResult.data.vehicles.map((v) => ({
            label: `${maskPlate(v.plate)} — ${v.brand} ${v.model}`,
            value: v.id,
          })),
        ]);
      if (dResult.success)
        setDrivers([
          { label: "Todos", value: "" },
          ...dResult.data.drivers.map((d) => ({ label: d.name, value: d.id })),
        ]);
    }
    loadOptions().then();
  }, []);

  const fetcher = useCallback(
    () => listTransportReport(filters, page, limit),
    [filters, page, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const transports = data?.success ? data.data.transports : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function applyFilters(next: TransportReportFilters) {
    setFilters(next);
    setPage(1);
  }

  function clearFilter(key: keyof TransportReportFilters) {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
    setPage(1);
  }

  function clearAll() {
    setFilters({});
    setPage(1);
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-foreground">
          Relatório de Transportes
        </h1>
        <p className="text-sm text-muted">
          Visualize e filtre todos os transportes do sistema
        </p>
      </div>

      <TransportReportFiltersPanel
        filters={filters}
        vehicles={vehicles}
        drivers={drivers}
        onApply={applyFilters}
        onClearOne={clearFilter}
        onClearAll={clearAll}
      />

      <AsyncState
        data={transports}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-8">
            Nenhum transporte encontrado com os filtros aplicados
          </p>
        }
      >
        {(transports) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Relatório de transportes">
                <Table.Header>
                  <Table.Column isRowHeader>Data</Table.Column>
                  <Table.Column>Saída</Table.Column>
                  <Table.Column>Veículo</Table.Column>
                  <Table.Column>Motorista</Table.Column>
                  <Table.Column>Passageiros</Table.Column>
                  <Table.Column>Agendamentos</Table.Column>
                  <Table.Column className="text-center">Status</Table.Column>
                  <Table.Column>Criado por</Table.Column>
                </Table.Header>

                <Table.Body>
                  {transports.map((transport) => {
                    const totalPassengers = countPassengers(
                      transport.appointments.map((a) => ({
                        patientId: a.appointment.patient.id,
                        hasCompanion: a.appointment.hasCompanion,
                        companionId: a.appointment.companion?.id,
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

                        <Table.Cell>
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
                          <div className="flex flex-col gap-0.5 max-w-48">
                            {transport.appointments
                              .slice(0, 2)
                              .map(({ appointment }, i) => (
                                <span
                                  key={i}
                                  className="text-xs text-muted truncate"
                                >
                                  · {appointment.patient.name}
                                  {appointment.hasCompanion ? " +1" : ""}
                                </span>
                              ))}
                            {transport.appointments.length > 2 && (
                              <span className="text-xs text-muted">
                                + {transport.appointments.length - 2} mais
                              </span>
                            )}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="h-full flex flex-col items-center">
                            {transport.isCanceled ? (
                              <Chip size="sm" color="danger">
                                Cancelado
                              </Chip>
                            ) : (
                              <Chip size="sm" color="success">
                                Ativo
                              </Chip>
                            )}
                            {transport.canceledBy && (
                              <span className="text-[10px] text-muted">
                                por {transport.canceledBy.name}
                              </span>
                            )}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-sm text-muted">
                            {transport.createdBy.name}
                          </span>
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
    </div>
  );
}
