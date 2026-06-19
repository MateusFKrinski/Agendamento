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
  listHealthSpecialties,
  deactivateHealthSpecialty,
  reactivateHealthSpecialty,
} from "@/actions/healthSpecialty";
import type { HealthSpecialtyRow } from "@/actions/types/healthSpecialty";
import { formSubmit } from "@/lib/form-submit";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import AppDrawer from "@/components/ui/app-drawer";
import HealthSpecialtyForm from "@/components/forms/health-specialty-form";

export default function Page() {
  const router = useRouter();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<HealthSpecialtyRow | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listHealthSpecialties(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const specialties = data?.success ? data.data.specialties : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(specialty: HealthSpecialtyRow) {
    setEditing(specialty);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleToggle(specialty: HealthSpecialtyRow) {
    setLoadingToggle(specialty.id);
    await formSubmit({
      action: () =>
        specialty.deletedAt
          ? reactivateHealthSpecialty(specialty.id)
          : deactivateHealthSpecialty(specialty.id),
      successMessage: specialty.deletedAt
        ? "Especialidade reativada"
        : "Especialidade desativada",
      onSuccess: refresh,
    });
    setLoadingToggle(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Especialidades
          </h1>
          <p className="text-sm text-muted">
            Gerencie as especialidades cadastradas
          </p>
        </div>
        <Button
          onPress={() => router.push("/dashboard/health-specialty/create")}
        >
          <PlusIcon size={16} />
          Nova especialidade
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar especialidade"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por nome" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={specialties}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhuma especialidade cadastrada
          </p>
        }
      >
        {(specialties) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de especialidades">
                <Table.Header>
                  <Table.Column isRowHeader>Nome</Table.Column>
                  <Table.Column>Observações</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {specialties.map((specialty) => (
                    <Table.Row key={specialty.id}>
                      <Table.Cell>
                        <span
                          className={[
                            "text-sm font-medium",
                            specialty.deletedAt
                              ? "text-muted line-through"
                              : "text-foreground",
                          ].join(" ")}
                        >
                          {specialty.name}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {specialty.observations ?? "—"}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={specialty.deletedAt ? "default" : "success"}
                        >
                          {specialty.deletedAt ? "Inativo" : "Ativo"}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(specialty)}
                          >
                            <PencilIcon size={14} />
                          </Button>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={
                              specialty.deletedAt ? "Reativar" : "Desativar"
                            }
                            isDisabled={loadingToggle === specialty.id}
                            onPress={() => handleToggle(specialty)}
                            className={
                              specialty.deletedAt
                                ? "text-success hover:bg-success/10"
                                : "text-danger hover:bg-danger/10"
                            }
                          >
                            {specialty.deletedAt ? (
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
          <HealthSpecialtyForm
            specialty={editing}
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
