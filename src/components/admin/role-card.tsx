"use client";

import { useState } from "react";
import { Button, Card, useOverlayState } from "@heroui/react";
import { TrashIcon, PencilIcon } from "lucide-react";
import { deleteRole } from "@/actions/role";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";
import AppDrawer from "@/components/ui/app-drawer";
import AdminRolePermissionsForm, {
  Role,
} from "@/components/forms/admin-role-permissions-form";

export default function RoleCard({
  role,
  afterSubmitAction,
}: {
  role: Role;
  afterSubmitAction: () => void;
}) {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const drawerState = useOverlayState({ defaultOpen: false });

  async function handleDelete() {
    setLoadingDelete(true);
    await formSubmit({
      action: () => deleteRole(role.id),
      successMessage: "Permissão removida com sucesso",
      onSuccess: afterSubmitAction,
    });
    setLoadingDelete(false);
  }

  return (
    <>
      <div className="w-full">
        <Card className="w-full">
          <Card.Header>
            <div className="flex flex-col items-start justify-between w-full px-1 gap-4">
              <div className="flex items-center gap-2">
                <Card.Title>{role.name}</Card.Title>
                <Card.Description>
                  {role.permissions.length} permissões · {role.users.length}{" "}
                  usuários
                </Card.Description>
              </div>

              <div className="w-full flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => drawerState.open()}
                  className="w-full"
                >
                  <PencilIcon size={14} />
                  Editar permissões
                </Button>

                <ButtonField
                  {...{
                    onPress: handleDelete,
                    isIconOnly: true,
                    size: "sm",
                    variant: "primary",
                    className: "w-fit px-6",
                  }}
                  isSubmitting={loadingDelete}
                  icon={TrashIcon}
                />
              </div>
            </div>
          </Card.Header>
        </Card>
      </div>

      <AppDrawer state={drawerState}>
        <div className="flex flex-col gap-1 mb-4">
          <p className="text-base font-semibold text-foreground">{role.name}</p>
          <p className="text-xs text-muted">
            {role.permissions.length} permissões · {role.users.length} usuários
          </p>
        </div>
        <AdminRolePermissionsForm
          role={role}
          afterSubmitAction={() => {
            drawerState.close();
            afterSubmitAction();
          }}
        />
      </AppDrawer>
    </>
  );
}
