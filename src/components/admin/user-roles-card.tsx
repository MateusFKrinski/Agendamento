import { Avatar, Button, Card, Chip } from "@heroui/react";
import { assignRoleToUser, removeRoleFromUser } from "@/actions/role";
import { Role } from "@/components/forms/admin-role-permissions-form";
import { useState } from "react";
import splitInitials from "@/lib/utils/split-initials";
import { formSubmit } from "@/lib/form-submit";

export type UserWithRoles = {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  roles: { role: { id: string; name: string } }[];
};

export default function UserRolesCard({
  user,
  roles,
  afterSubmitAction,
}: {
  user: UserWithRoles;
  roles: Role[];
  afterSubmitAction: () => void;
}) {
  const userRoleIds = user.roles.map((r) => r.role.id);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAssign(roleId: string) {
    setLoading(roleId);
    await formSubmit({
      action: () => assignRoleToUser(user.id, { roleId }),
      successMessage: "Permissão atribuída com sucesso",
      onSuccess: () => {
        afterSubmitAction();
      },
    });
    setLoading(null);
  }

  async function handleRemove(roleId: string) {
    setLoading(roleId);
    await formSubmit({
      action: () => removeRoleFromUser(user.id, roleId),
      successMessage: "Permissão removida com sucesso",
      onSuccess: () => {
        afterSubmitAction();
      },
    });
    setLoading(null);
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar size="md" color="accent">
              <Avatar.Fallback>{splitInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Card.Title>{user.name}</Card.Title>
              <Card.Description className="-mt-1">
                @{user.username}
              </Card.Description>
            </div>
          </div>
          {user.isAdmin && (
            <Chip size="sm" color="accent">
              Admin
            </Chip>
          )}
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-2">
          {roles.map((role) => {
            const hasRole = userRoleIds.includes(role.id);
            return (
              <div
                key={role.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-default"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {role.name}
                  </p>
                  <p className="text-xs text-muted">
                    {role.permissions.length} permissões
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={!!loading}
                  onPress={() =>
                    hasRole ? handleRemove(role.id) : handleAssign(role.id)
                  }
                  className={
                    hasRole
                      ? "text-danger hover:bg-danger/10"
                      : "text-accent hover:bg-accent/10"
                  }
                >
                  {hasRole ? "Remover" : "Atribuir"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
