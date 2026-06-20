"use client";

import { Button, Chip, Separator, useOverlayState } from "@heroui/react";
import { HelpCircleIcon } from "lucide-react";
import AppDrawer from "@/components/ui/app-drawer";
import SectionLabel from "@/components/ui/section-label";
import type { TemplateKeysDoc } from "@/lib/documents/template-keys";

export default function TemplateKeysHelp({ doc }: { doc: TemplateKeysDoc }) {
  const drawerState = useOverlayState({ defaultOpen: false });

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Ver chaves disponíveis no modelo"
        onPress={drawerState.open}
        className="text-muted hover:text-foreground"
      >
        <HelpCircleIcon size={15} />
      </Button>

      <AppDrawer state={drawerState}>
        <div className="flex flex-col gap-5 pb-2.5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Chaves do modelo — {doc.title}
            </h2>
            <p className="text-xs text-muted">{doc.intro}</p>
          </div>

          {doc.groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SectionLabel>{group.title}</SectionLabel>
                {group.loop && (
                  <Chip size="sm" color="accent" variant="primary">
                    loop: {group.loop}
                  </Chip>
                )}
              </div>

              {group.description && (
                <p className="text-xs text-muted">{group.description}</p>
              )}

              <div className="flex flex-col gap-1">
                {group.keys.map((k) => (
                  <div
                    key={k.key}
                    className="flex items-baseline gap-2 px-3 py-1.5 rounded-xl bg-default"
                  >
                    <code className="text-xs font-mono text-foreground shrink-0">
                      {`{${k.key}}`}
                    </code>
                    <span className="text-xs text-muted">{k.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {doc.loopExample && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <SectionLabel>Exemplo de loop no modelo</SectionLabel>
                <p className="text-xs text-muted">
                  Use os marcadores {`{#lista}`} … {`{/lista}`} para repetir um
                  bloco, aninhando unidades → pacientes → consultas.
                </p>
                <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap px-3 py-2 rounded-xl bg-default overflow-x-auto">
                  {doc.loopExample}
                </pre>
              </div>
            </>
          )}
        </div>
      </AppDrawer>
    </>
  );
}
