"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Chip,
  SearchField,
  Table,
  useOverlayState,
} from "@heroui/react";
import { PlusIcon, PencilIcon, PowerOffIcon, PowerIcon } from "lucide-react";
import {
  listVehicles,
  deactivateVehicle,
  reactivateVehicle,
} from "@/actions/vehicle";
import type { VehicleRow } from "@/actions/types/vehicle";
import { formSubmit } from "@/lib/form-submit";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import AppDrawer from "@/components/ui/app-drawer";
import { maskPlate } from "@/lib/utils/masks";
import VehicleForm from "@/components/forms/vehicle-form";

export default function Page() {
  const router = useRouter();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<VehicleRow | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listVehicles(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const vehicles = data?.success ? data.data.vehicles : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(vehicle: VehicleRow) {
    setEditing(vehicle);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleToggle(vehicle: VehicleRow) {
    setLoadingToggle(vehicle.id);
    await formSubmit({
      action: () =>
        vehicle.deletedAt
          ? reactivateVehicle(vehicle.id)
          : deactivateVehicle(vehicle.id),
      successMessage: vehicle.deletedAt
        ? "Veículo reativado"
        : "Veículo desativado",
      onSuccess: refresh,
    });
    setLoadingToggle(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Veículos</h1>
          <p className="text-sm text-muted">Gerencie os veículos cadastrados</p>
        </div>
        <Button onPress={() => router.push("/dashboard/vehicle/create")}>
          <PlusIcon size={16} />
          Novo veículo
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar veículo"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por placa, modelo ou marca" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={vehicles}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum veículo cadastrado
          </p>
        }
      >
        {(vehicles) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de veículos">
                <Table.Header>
                  <Table.Column isRowHeader>Placa</Table.Column>
                  <Table.Column>Veículo</Table.Column>
                  <Table.Column>Ano</Table.Column>
                  <Table.Column>Capacidade</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {vehicles.map((vehicle) => (
                    <Table.Row key={vehicle.id}>
                      <Table.Cell>
                        <span
                          className={[
                            "text-sm font-mono font-medium",
                            vehicle.deletedAt
                              ? "text-muted line-through"
                              : "text-foreground",
                          ].join(" ")}
                        >
                          {maskPlate(vehicle.plate)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {vehicle.brand} {vehicle.model}
                          </span>
                          {vehicle.color && (
                            <span className="text-xs text-muted">
                              {vehicle.color}
                            </span>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {vehicle.year}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {vehicle.capacity} lugares
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={vehicle.deletedAt ? "default" : "success"}
                        >
                          {vehicle.deletedAt ? "Inativo" : "Ativo"}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(vehicle)}
                          >
                            <PencilIcon size={14} />
                          </Button>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={
                              vehicle.deletedAt ? "Reativar" : "Desativar"
                            }
                            isDisabled={loadingToggle === vehicle.id}
                            onPress={() => handleToggle(vehicle)}
                            className={
                              vehicle.deletedAt
                                ? "text-success hover:bg-success/10"
                                : "text-danger hover:bg-danger/10"
                            }
                          >
                            {vehicle.deletedAt ? (
                              <PowerIcon size={14} />
                            ) : (
                              <PowerOffIcon size={14} />
                            )}
                          </Button>
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
        {editing && (
          <VehicleForm
            vehicle={editing}
            afterSubmitAction={() => {
              handleCloseDrawer();
              refresh().then();
            }}
          />
        )}
      </AppDrawer>
    </div>
  );
}
