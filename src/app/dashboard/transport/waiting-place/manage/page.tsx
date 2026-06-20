"use client";

import { useState, useCallback } from "react";
import { Button, SearchField, Table, useOverlayState } from "@heroui/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { listWaitingPlaces, deleteWaitingPlace } from "@/actions/waitingPlace";
import { WaitingPlaceRow } from "@/actions/types/waitingPlace";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import AppDrawer from "@/components/ui/app-drawer";
import { formSubmit } from "@/lib/form-submit";
import WaitingPlaceForm from "@/components/forms/waiting-place-form";

export default function Page() {
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<WaitingPlaceRow | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listWaitingPlaces(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const waitingPlaces = data?.success ? data.data.waitingPlaces : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(waitingPlace: WaitingPlaceRow) {
    setEditing(waitingPlace);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleDelete(waitingPlace: WaitingPlaceRow) {
    setLoadingDelete(waitingPlace.id);
    await formSubmit({
      action: () => deleteWaitingPlace(waitingPlace.id),
      successMessage: "Local de espera removido",
      onSuccess: refresh,
    });
    setLoadingDelete(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Locais de espera
        </h1>
        <p className="text-sm text-muted">
          Gerencie os locais onde os pacientes aguardam o transporte
        </p>
      </div>

      <WaitingPlaceForm inline afterSubmitAction={refresh} />

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar local de espera"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por nome" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={waitingPlaces}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum local de espera cadastrado
          </p>
        }
      >
        {(waitingPlaces) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de locais de espera">
                <Table.Header>
                  <Table.Column isRowHeader>Nome</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {waitingPlaces.map((wp) => (
                    <Table.Row key={wp.id}>
                      <Table.Cell>
                        <span className="text-sm font-medium text-foreground">
                          {wp.name}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(wp)}
                          >
                            <PencilIcon size={14} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Excluir"
                            isDisabled={loadingDelete === wp.id}
                            onPress={() => handleDelete(wp)}
                            className="text-danger hover:bg-danger/10"
                          >
                            <TrashIcon size={14} />
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

      <AppDrawer state={drawerState} width="w-sm">
        {editing && (
          <WaitingPlaceForm
            waitingPlace={editing}
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
