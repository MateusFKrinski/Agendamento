"use client";

import { useState } from "react";
import { Accordion, Checkbox, CheckboxGroup, Label } from "@heroui/react";
import { PencilIcon, SaveIcon } from "lucide-react";
import { NAV_ROUTES, NavChild, NavItem } from "@/lib/nav";
import { Action, Resource } from "@/lib/permissions";
import { updateRolePermissions } from "@/actions/role";
import { formSubmit } from "@/lib/form-submit";
import ButtonField from "@/components/ui/button-field";

export type Permission = { id: string; action: string; resource: string };
export type Role = {
  id: string;
  name: string;
  permissions: { permission: Permission }[];
  users: { user: { id: string; name: string } }[];
};

const ACTION_LABEL: Record<Action, string> = {
  create: "Criar",
  read: "Ler",
  update: "Atualizar",
  delete: "Deletar",
};

function toKey(action: string, resource: string) {
  return `${action}:${resource}`;
}

export default function AdminRolePermissionsForm({
  role,
  afterSubmitAction,
}: {
  role: Role;
  afterSubmitAction: () => void;
}) {
  const currentKeys = role.permissions.map((rp) =>
    toKey(rp.permission.action, rp.permission.resource),
  );

  const [selected, setSelected] = useState<string[]>(currentKeys);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await formSubmit({
      action: () =>
        updateRolePermissions(role.id, { permissionKeys: selected }),
      successMessage: "Permissões atualizadas com sucesso",
      onSuccess: afterSubmitAction,
    });
    setLoading(false);
  }

  const sections = NAV_ROUTES.filter(
    (item): item is NavItem & { children: NavChild[] } =>
      "children" in item && Array.isArray(item.children),
  )
    .map((item) => ({
      label: item.label,
      icon: item.icon,
      children: item.children.filter(
        (
          child,
        ): child is NavChild & { resource: Resource; actions: Action[] } =>
          !child.public,
      ),
    }))
    .filter((section) => section.children.length > 0);

  return (
    <div>
      <CheckboxGroup value={selected} onChange={setSelected}>
        <Accordion>
          {sections.map((section) => (
            <Accordion.Item key={section.label} id={section.label}>
              <Accordion.Heading>
                <Accordion.Trigger className="flex gap-2 rounded-2xl my-2 text-accent">
                  <PencilIcon size={14} className="shrink-0" />
                  {section.label}
                  <span className="text-xs text-muted">
                    {section.children.length} rotas
                  </span>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="flex flex-col gap-5">
                    {section.children.map((child) => (
                      <div
                        key={child.href}
                        className="w-full flex items-start justify-between"
                      >
                        <div className="w-full flex flex-col gap-2">
                          <div className="w-full flex items-center gap-5">
                            <span className="text-sm text-foreground">
                              {child.label}
                            </span>
                            <code className="text-xs text-muted bg-default px-2 py-0.5 rounded-full w-fit">
                              {child.href}
                            </code>
                          </div>

                          <div className="flex gap-8">
                            {(
                              ["create", "read", "update", "delete"] as Action[]
                            ).map((action) => {
                              const key = toKey(action, child.resource);
                              const available = child.actions.includes(action);
                              if (!available) return null;

                              return (
                                <Checkbox
                                  key={key}
                                  value={key}
                                  style={{ marginTop: 0 }}
                                >
                                  <Checkbox.Control className="bg-default">
                                    <Checkbox.Indicator />
                                  </Checkbox.Control>
                                  <Checkbox.Content>
                                    <Label>{ACTION_LABEL[action]}</Label>
                                  </Checkbox.Content>
                                </Checkbox>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </CheckboxGroup>

      <ButtonField
        isSubmitting={loading}
        label="Salvar permissões"
        icon={SaveIcon}
        {...{ onPress: handleSave, className: "w-full" }}
      />
    </div>
  );
}
