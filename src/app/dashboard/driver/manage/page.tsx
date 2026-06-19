"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Chip,
  SearchField,
  Table,
  useOverlayState,
} from "@heroui/react";
import { PlusIcon, PencilIcon, PowerOffIcon, PowerIcon } from "lucide-react";
import {
  listDrivers,
  deactivateDriver,
  reactivateDriver,
} from "@/actions/driver";
import DriverEditForm from "@/components/forms/driver-edit-form";
import { formSubmit } from "@/lib/form-submit";
import { maskCPF } from "@/lib/utils/masks";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import splitInitials from "@/lib/utils/split-initials";
import { DriverRow } from "@/actions/types/driver";
import AppDrawer from "@/components/ui/app-drawer";

const CNH_EXPIRATION_WARNING_DAYS = 30;

function isExpiringSoon(date: Date): boolean {
  const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= CNH_EXPIRATION_WARNING_DAYS;
}

export default function Page() {
  const router = useRouter();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DriverRow | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listDrivers(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const drivers = data?.success ? data.data.drivers : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(driver: DriverRow) {
    setEditing(driver);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleToggle(driver: DriverRow) {
    setLoadingToggle(driver.id);
    await formSubmit({
      action: () =>
        driver.deletedAt
          ? reactivateDriver(driver.id)
          : deactivateDriver(driver.id),
      successMessage: driver.deletedAt
        ? "Motorista reativado"
        : "Motorista desativado",
      onSuccess: refresh,
    });
    setLoadingToggle(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Motoristas</h1>
          <p className="text-sm text-muted">
            Gerencie os motoristas cadastrados
          </p>
        </div>
        <Button onPress={() => router.push("/dashboard/driver/create")}>
          <PlusIcon size={16} />
          Novo motorista
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar motorista"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por nome ou CPF" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={drivers}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum motorista cadastrado
          </p>
        }
      >
        {(drivers) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de motoristas">
                <Table.Header>
                  <Table.Column isRowHeader>Motorista</Table.Column>
                  <Table.Column>CPF</Table.Column>
                  <Table.Column>CNH</Table.Column>
                  <Table.Column>Validade CNH</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {drivers.map((driver) => (
                    <Table.Row key={driver.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" color="accent">
                            <Avatar.Fallback>
                              {splitInitials(driver.name)}
                            </Avatar.Fallback>
                          </Avatar>
                          <span
                            className={[
                              "text-sm font-medium",
                              driver.deletedAt
                                ? "text-muted line-through"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {driver.name}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted font-mono">
                          {maskCPF(driver.cpf)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip size="sm" color="default">
                          {driver.cnhCategory}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <span
                          className={[
                            "text-sm",
                            isExpiringSoon(driver.cnhExpiration)
                              ? "text-danger"
                              : "text-muted",
                          ].join(" ")}
                        >
                          {driver.cnhExpiration.toLocaleDateString("pt-BR")}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={driver.deletedAt ? "default" : "success"}
                        >
                          {driver.deletedAt ? "Inativo" : "Ativo"}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(driver)}
                          >
                            <PencilIcon size={14} />
                          </Button>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={
                              driver.deletedAt ? "Reativar" : "Desativar"
                            }
                            isDisabled={loadingToggle === driver.id}
                            onPress={() => handleToggle(driver)}
                            className={
                              driver.deletedAt
                                ? "text-success hover:bg-success/10"
                                : "text-danger hover:bg-danger/10"
                            }
                          >
                            {driver.deletedAt ? (
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
          <DriverEditForm
            driver={editing}
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
