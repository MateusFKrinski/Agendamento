"use client";

import { Button, Separator } from "@heroui/react";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/contexts/sidebarContext";
import { useSession } from "next-auth/react";
import Switcher from "@/components/theme/switcher";

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function Header() {
  const { toggle } = useSidebar();
  const { data: session } = useSession();
  const greeting = useGreeting();
  const firstName = session?.user.name?.split(" ")[0] ?? "";

  return (
    <header className="h-14 w-full border-b border-border px-4 bg-background flex items-center justify-between gap-4 shrink-0">
      <div className="w-full flex items-center gap-3">
        <Button
          isIconOnly
          onPress={toggle}
          aria-label="Alternar sidebar"
          variant="ghost"
          size="sm"
          className="text-muted hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </Button>

        <Separator orientation="vertical" />

        <p className="text-sm text-muted hidden sm:block">
          {greeting},{" "}
          <span className="text-foreground font-medium">{firstName}</span>
        </p>
      </div>

      <Switcher />
    </header>
  );
}
