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
  listPeople,
  deactivatePerson,
  reactivatePerson,
} from "@/actions/person";
import type { PersonRow } from "@/actions/types/person";
import PersonForm from "@/components/forms/person-form";
import { formSubmit } from "@/lib/form-submit";
import splitInitials from "@/lib/utils/split-initials";
import { maskCPF, maskPhone } from "@/lib/utils/masks";
import { useFetch } from "@/lib/hooks/use-fetch";
import { usePagination } from "@/lib/hooks/use-pagination";
import { AsyncState } from "@/components/ui/async-state";
import { TablePagination } from "@/components/ui/table-pagination";
import AppDrawer from "@/components/ui/app-drawer";

export default function Page() {
  const router = useRouter();
  const drawerState = useOverlayState({ defaultOpen: false });

  const { page, setPage, limit, handleLimitChange } = usePagination(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PersonRow | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const fetcher = useCallback(
    () => listPeople(page, search, limit),
    [page, search, limit],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const people = data?.success ? data.data.people : [];
  const total = data?.success ? data.data.total : 0;
  const pages = data?.success ? data.data.pages : 1;

  function handleEdit(person: PersonRow) {
    setEditing(person);
    drawerState.open();
  }

  function handleCloseDrawer() {
    drawerState.close();
    setEditing(null);
  }

  async function handleToggle(person: PersonRow) {
    setLoadingToggle(person.id);
    await formSubmit({
      action: () =>
        person.deletedAt
          ? reactivatePerson(person.id)
          : deactivatePerson(person.id),
      successMessage: person.deletedAt
        ? "Pessoa reativada"
        : "Pessoa desativada",
      onSuccess: refresh,
    });
    setLoadingToggle(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pessoas</h1>
          <p className="text-sm text-muted">Gerencie as pessoas cadastradas</p>
        </div>
        <Button onPress={() => router.push("/dashboard/person/create")}>
          <PlusIcon size={16} />
          Nova pessoa
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        aria-label="Buscar pessoa"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar por nome ou CPF" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <AsyncState
        data={people}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhuma pessoa cadastrada
          </p>
        }
      >
        {(people) => (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Lista de pessoas">
                <Table.Header>
                  <Table.Column isRowHeader>Pessoa</Table.Column>
                  <Table.Column>CPF</Table.Column>
                  <Table.Column>Telefone</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column aria-label="Ações" />
                </Table.Header>

                <Table.Body>
                  {people.map((person) => (
                    <Table.Row key={person.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" color="accent">
                            <Avatar.Fallback>
                              {splitInitials(person.name)}
                            </Avatar.Fallback>
                          </Avatar>
                          <span
                            className={[
                              "text-sm font-medium",
                              person.deletedAt
                                ? "text-muted line-through"
                                : "text-foreground",
                            ].join(" ")}
                          >
                            {person.name}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted font-mono">
                          {maskCPF(person.cpf)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <span className="text-sm text-muted">
                          {maskPhone(person.phone)}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip
                          size="sm"
                          color={person.deletedAt ? "default" : "success"}
                        >
                          {person.deletedAt ? "Inativo" : "Ativo"}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Editar"
                            onPress={() => handleEdit(person)}
                          >
                            <PencilIcon size={14} />
                          </Button>

                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={
                              person.deletedAt ? "Reativar" : "Desativar"
                            }
                            isDisabled={loadingToggle === person.id}
                            onPress={() => handleToggle(person)}
                            className={
                              person.deletedAt
                                ? "text-success hover:bg-success/10"
                                : "text-danger hover:bg-danger/10"
                            }
                          >
                            {person.deletedAt ? (
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
          <PersonForm
            person={editing}
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
