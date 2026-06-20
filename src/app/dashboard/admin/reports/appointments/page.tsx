"use client";

import { useState, useCallback, useEffect } from "react";
import { Chip, Table } from "@heroui/react";
import { listAppointmentReport } from "@/actions/reports";
import { listHealthSpecialties } from "@/actions/healthSpecialty";
import { listHealthUnits } from "@/actions/healthUnit";
import { listWaitingPlaces } from "@/actions/waitingPlace";
import { listUsers } from "@/actions/user";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { AppointmentReportFilters } from "@/lib/schemas/appointmentReportFilters";
import { AppointmentReportFiltersPanel } from "@/components/reports/appointment-report-filters";

type SelectOption = { label: string; value: string };

export default function Page() {
  const { page, setPage, limit, handleLimitChange } = usePagination(20);
  const [filters, setFilters] = useState<AppointmentReportFilters>({});

  const [specialties, setSpecialties] = useState<SelectOption[]>([]);
  const [healthUnits, setHealthUnits] = useState<SelectOption[]>([]);
  const [waitingPlaces, setWaitingPlaces] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const [sResult, uResult, wResult, usResult] = await Promise.all([
        listHealthSpecialties(1, "", 999),
        listHealthUnits(1, "", 999),
        listWaitingPlaces(1, "", 999),
        listUsers(),
      ]);
      if (sResult.success)
        setSpecialties([
          { label: "Todas", value: "" },
          ...sResult.data.specialties.map((s) => ({
            label: s.name,
            value: s.id,
          })),
        ]);
      if (uResult.success)
        setHealthUnits([
          { label: "Todas", value: "" },
          ...uResult.data.units.map((u) => ({
            label: u.unitName,
            value: u.id,
          })),
        ]);
      if (wResult.success)
        setWaitingPlaces([
          { label: "Todos", value: "" },
          ...wResult.data.waitingPlaces.map((w) => ({
            label: w.name,
            value: w.id,
          })),
        ]);
      if (usResult.success)
        setUsers([
          { label: "Todos", value: "" },
          ...usResult.data.users.map((u) => ({ label: u.name, value: u.id })),
        ]);
    }
    loadOptions().then();
  }, []);

  const fetcher = useCallback(
    () => listAppointmentReport(filters, page, limit),
    [filters, page, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const appointments = data?.success ? data.data.appointments : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function applyFilters(next: AppointmentReportFilters) {
    setFilters(next);
    setPage(1);
  }

  function clearFilter(key: keyof AppointmentReportFilters) {
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
          Relatório de Agendamentos
        </h1>
        <p className="text-sm text-muted">
          Visualize e filtre todos os agendamentos do sistema
        </p>
      </div>

      <AppointmentReportFiltersPanel
        filters={filters}
        specialties={specialties}
        healthUnits={healthUnits}
        waitingPlaces={waitingPlaces}
        users={users}
        onApply={applyFilters}
        onClearOne={clearFilter}
        onClearAll={clearAll}
      />

      <AsyncState
        data={appointments}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-8">
            Nenhum agendamento encontrado com os filtros aplicados
          </p>
        }
      >
        {(appointments) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Relatório de agendamentos">
                <Table.Header>
                  <Table.Column isRowHeader>Data</Table.Column>
                  <Table.Column>Horário</Table.Column>
                  <Table.Column>Paciente</Table.Column>
                  <Table.Column>Especialidade</Table.Column>
                  <Table.Column>Unidade</Table.Column>
                  <Table.Column>Local de espera</Table.Column>
                  <Table.Column className="text-center">Status</Table.Column>
                  <Table.Column>Criado por</Table.Column>
                </Table.Header>

                <Table.Body>
                  {appointments.map((appointment) => (
                    <Table.Row key={appointment.id}>
                      <Table.Cell>
                        <span className="text-sm text-foreground">
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
                        <div className="h-full flex flex-col items-center">
                          {appointment.isCanceled ? (
                            <Chip size="sm" color="danger">
                              Cancelado
                            </Chip>
                          ) : appointment.transports.length > 0 ? (
                            <Chip size="sm" color="success">
                              Escalado
                            </Chip>
                          ) : (
                            <Chip size="sm" color="warning">
                              Pendente
                            </Chip>
                          )}
                          {appointment.canceledBy && (
                            <span className="text-[10px] text-muted">
                              por {appointment.canceledBy.name}
                            </span>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {appointment.createdBy.name}
                        </span>
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
    </div>
  );
}
