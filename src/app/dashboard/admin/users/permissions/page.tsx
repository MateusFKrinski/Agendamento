"use client";

import { listRoles, listUsersWithRoles } from "@/actions/role";
import AdminRoleCreateForm from "@/components/forms/admin-role-create-form";
import RoleCard from "@/components/admin/role-card";
import UserRolesCard from "@/components/admin/user-roles-card";
import { useFetch } from "@/lib/hooks/use-fetch";
import { AsyncState } from "@/components/ui/async-state";

export default function Page() {
  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
    refresh: rolesRefresh,
  } = useFetch(listRoles);
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refresh: usersRefresh,
  } = useFetch(listUsersWithRoles);

  const roles = rolesData?.success ? rolesData.data.roles : [];
  const users = usersData?.success ? usersData.data.users : [];

  return (
    <div className="w-full flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Permissões</h1>
        <p className="text-sm text-muted">
          Gerencie as permissões e as atribua aos usuários
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-center">
          <AdminRoleCreateForm afterSubmitAction={rolesRefresh} />
        </div>

        <AsyncState
          data={roles}
          loading={rolesLoading}
          error={rolesError}
          onRetry={rolesRefresh}
          className="flex justify-center"
          empty={
            <p className="text-sm text-muted text-center py-4">
              Nenhuma permissão cadastrada
            </p>
          }
        >
          {(roles) => (
            <div className="grid gap-3 items-start grid-cols-3 2xl:grid-cols-4">
              {roles.map((role) => (
                <div className="w-full" key={role.id}>
                  <RoleCard role={role} afterSubmitAction={rolesRefresh} />
                </div>
              ))}
            </div>
          )}
        </AsyncState>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Atribuição de permissões
        </h1>

        <AsyncState
          data={users}
          loading={usersLoading}
          error={usersError}
          onRetry={usersRefresh}
          className="flex justify-center"
          empty={
            <p className="text-sm text-muted text-center py-4">
              Nenhum usuário cadastrado
            </p>
          }
        >
          {(users) => (
            <div className="grid grid-cols-3 gap-3 items-start 2xl:grid-cols-4">
              {users.map((user) => (
                <UserRolesCard
                  key={user.id}
                  user={user}
                  roles={roles}
                  afterSubmitAction={usersRefresh}
                />
              ))}
            </div>
          )}
        </AsyncState>
      </div>
    </div>
  );
}
