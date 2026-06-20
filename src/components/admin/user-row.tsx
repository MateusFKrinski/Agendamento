"use client";

import { useState } from "react";
import { Accordion, Avatar, Card, Chip } from "@heroui/react";
import {
  PencilIcon,
  KeyRoundIcon,
  PowerOff,
  PowerIcon,
  PowerOffIcon,
} from "lucide-react";
import { deactivateUser, reactivateUser } from "@/actions/user";
import AdminUserResetPasswordForm from "@/components/forms/admin-user-reset-password-form";
import { getInitials } from "@/lib/utils";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";
import { Prisma } from "@/generated/prisma";
import AdminUserForm from "@/components/forms/admin-user-form";

export default function UserRow({
  user,
  afterSubmitAction,
}: {
  user: Prisma.UserGetPayload<{
    omit: {
      createdAt: true;
      hashPassword: true;
      lastPasswordChangedAt: true;
      updatedAt: true;
    };
  }>;
  afterSubmitAction: () => void;
}) {
  const [loadingToggle, setLoadingToggle] = useState(false);
  const isActive = !user.deletedAt;

  async function handleToggleActive() {
    setLoadingToggle(true);
    await formSubmit({
      action: () =>
        isActive ? deactivateUser(user.id) : reactivateUser(user.id),
      successMessage: isActive ? "Usuário desativado" : "Usuário reativado",
      onSuccess: afterSubmitAction,
    });
    setLoadingToggle(false);
  }

  return (
    <Card className="w-full">
      <Card.Header>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Avatar size="lg" color="accent">
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <div>
              <Card.Title
                className={!isActive ? "text-muted line-through" : ""}
              >
                {user.name}
              </Card.Title>
              <Card.Description>@{user.username}</Card.Description>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {user.isAdmin && (
              <Chip size="sm" color="accent">
                Admin
              </Chip>
            )}
            {!isActive && (
              <Chip size="sm" color="accent">
                Desativado
              </Chip>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        <Accordion>
          <Accordion.Item id="edit">
            <Accordion.Heading>
              <Accordion.Trigger className="flex gap-2 rounded-2xl my-2">
                <PencilIcon size={14} className="shrink-0" />
                Editar dados
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                <AdminUserForm
                  user={user}
                  afterSubmitAction={afterSubmitAction}
                />
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item id="password">
            <Accordion.Heading>
              <Accordion.Trigger className="flex gap-2 rounded-2xl my-2">
                <KeyRoundIcon size={14} className="shrink-0" />
                Redefinir senha
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                <AdminUserResetPasswordForm
                  userId={user.id}
                  afterSubmitAction={afterSubmitAction}
                />
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item id="toggle">
            <Accordion.Heading>
              <Accordion.Trigger
                className={["flex gap-2 rounded-2xl my-2"].join(" ")}
              >
                {isActive ? (
                  <PowerOff size={14} className="shrink-0" />
                ) : (
                  <PowerIcon size={14} className="shrink-0" />
                )}
                {isActive ? "Desativar usuário" : "Reativar usuário"}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                <div className="flex flex-col gap-2 py-2">
                  <ButtonField
                    {...{
                      onPress: handleToggleActive,
                      className: [
                        "w-full bg-transparent",
                        isActive
                          ? "text-danger hover:bg-danger/10"
                          : "text-success hover:bg-success/10",
                      ].join(" "),
                    }}
                    isSubmitting={loadingToggle}
                    label={isActive ? "Desativar usuário" : "Ativar usuário"}
                    icon={isActive ? PowerOffIcon : PowerIcon}
                  />
                </div>
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card.Content>
    </Card>
  );
}
