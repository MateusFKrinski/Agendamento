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
  listHealthUnits,
  deactivateHealthUnit,
  reactivateHealthUnit,
} from "@/actions/healthUnit";
import type { HealthUnitRow } from "@/actions/types/healthUnit";
import { formSubmit } from "@/lib/form-submit";
import { maskCNPJ, maskPhone } from "@/lib/utils/masks";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import AppDrawer from "@/components/ui/app-drawer";
import { UNIT_TYPE_LABELS } from "@/lib/schemas/healthUnit";
import HealthUnitForm from "@/components/forms/health-unit-form";

export default function Page() {
  const router = useRouter();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<HealthUnitRow | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listHealthUnits(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const units = data?.success ? data.data.units : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(unit: HealthUnitRow) {
    setEditing(unit);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleToggle(unit: HealthUnitRow) {
    setLoadingToggle(unit.id);
    await formSubmit({
      action: () =>
        unit.deletedAt
          ? reactivateHealthUnit(unit.id)
          : deactivateHealthUnit(unit.id),
      successMessage: unit.deletedAt
        ? "Unidade reativada"
        : "Unidade desativada",
      onSuccess: refresh,
    });
    setLoadingToggle(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Unidades de saúde
          </h1>
          <p className="text-sm text-muted">
            Gerencie as unidades de saúde cadastradas
          </p>
        </div>
        <Button onPress={() => router.push("/dashboard/health-unit/create")}>
          <PlusIcon size={16} />
          Nova unidade
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar unidade"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por nome ou CNPJ" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={units}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhuma unidade cadastrada
          </p>
        }
      >
        {(units) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de unidades de saúde">
                <Table.Header>
                  <Table.Column isRowHeader>Nome</Table.Column>
                  <Table.Column>Tipo</Table.Column>
                  <Table.Column>CNPJ</Table.Column>
                  <Table.Column>Telefone</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {units.map((unit) => (
                    <Table.Row key={unit.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span
                            className={[
                              "text-sm font-medium",
                              unit.deletedAt
                                ? "text-muted line-through"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {unit.unitName}
                          </span>
                          <span className="text-xs text-muted">
                            {unit.address.city} — {unit.address.state}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip size="sm" color="default">
                          {UNIT_TYPE_LABELS[unit.unitType]}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted font-mono">
                          {maskCNPJ(unit.cnpj)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {maskPhone(unit.phone)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={unit.deletedAt ? "default" : "success"}
                        >
                          {unit.deletedAt ? "Inativo" : "Ativo"}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(unit)}
                          >
                            <PencilIcon size={14} />
                          </Button>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={
                              unit.deletedAt ? "Reativar" : "Desativar"
                            }
                            isDisabled={loadingToggle === unit.id}
                            onPress={() => handleToggle(unit)}
                            className={
                              unit.deletedAt
                                ? "text-success hover:bg-success/10"
                                : "text-danger hover:bg-danger/10"
                            }
                          >
                            {unit.deletedAt ? (
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
          <HealthUnitForm
            unit={editing}
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
