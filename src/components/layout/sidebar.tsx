"use client";

import { useSidebar } from "@/contexts/sidebarContext";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Avatar, Button, ScrollShadow, Separator } from "@heroui/react";
import { NAV_SECTIONS, NavItem, NavChild } from "@/lib/nav";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import splitInitials from "@/lib/utils/split-initials";

function canSeeChild(
  child: NavChild,
  isAdmin: boolean,
  permissions: string[],
): boolean {
  if (isAdmin) return true;
  if (child.public) return true;
  return child.actions.every((action) =>
    permissions.includes(`${action}:${child.resource}`),
  );
}

function canSeeRoute(
  item: NavItem,
  isAdmin: boolean,
  permissions: string[],
): boolean {
  if (isAdmin) return true;

  if (item.children) {
    return item.children.some((child) =>
      canSeeChild(child, isAdmin, permissions),
    );
  }

  if (item.public) return true;
  return item.actions.every((action) =>
    permissions.includes(`${action}:${item.resource}`),
  );
}

function NavGroup({
  item,
  isAdmin,
  permissions,
}: {
  item: NavItem;
  isAdmin: boolean;
  permissions: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isRouteActive(pathname: string, href: string): boolean {
    if (pathname === href) return true;
    if (href === "/dashboard") return false;
    return pathname.startsWith(href + "/");
  }

  const isChildActive =
    item.children?.some((child) => isRouteActive(pathname, child.href)) ??
    false;
  const isActive = item.href
    ? isRouteActive(pathname, item.href)
    : isChildActive;

  const [open, setOpen] = useState(isChildActive);

  const activeClass = "bg-default font-medium text-accent";
  const inactiveClass =
    "text-muted hover:bg-default hover:text-foreground font-normal";

  const itemClass = [
    "w-full flex items-center gap-2.5 px-4 text-sm transition-colors",
    isActive ? activeClass : inactiveClass,
  ].join(" ");

  if (item.children) {
    const visibleChildren = item.children.filter((child) =>
      canSeeChild(child, isAdmin, permissions),
    );

    return (
      <div>
        <Button
          variant="ghost"
          onPress={() => setOpen((p) => !p)}
          className={itemClass}
        >
          <item.icon size={16} className="shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            size={13}
            className={[
              "transition-transform duration-200 text-muted",
              open ? "rotate-0" : "-rotate-90",
            ].join(" ")}
          />
        </Button>

        <div
          className={[
            "overflow-hidden transition-all duration-200",
            open ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="ml-3.5 mt-1 pl-3 border-l border-border flex flex-col gap-1">
            {visibleChildren.map((child) => {
              const isChildCurrent = pathname.startsWith(child.href);
              return (
                <Button
                  key={child.href}
                  variant="ghost"
                  onPress={() => router.push(child.href)}
                  className={[
                    "w-full flex justify-start px-4 text-xs transition-colors",
                    isChildCurrent
                      ? "text-accent font-medium"
                      : "text-muted hover:text-foreground hover:bg-default",
                  ].join(" ")}
                >
                  {child.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onPress={() => router.push(item.href!)}
      className={itemClass}
    >
      <item.icon size={16} className="shrink-0" />
      <span className="flex-1 flex justify-start">{item.label}</span>
    </Button>
  );
}

export function AppSidebar() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isAdmin = session?.user.isAdmin ?? false;
  const permissions = session?.user.permissions ?? [];

  const name = session?.user.name ?? "";

  const isPerfilActive = pathname === "/dashboard/me";

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      canSeeRoute(item, isAdmin, permissions),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={[
        "h-screen bg-background border-r border-border z-40 shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "w-65" : "w-0",
      ].join(" ")}
    >
      <div className="px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-2xl bg-default">
          <Avatar size="sm" color="accent">
            <Avatar.Fallback>{splitInitials(name)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent truncate leading-tight">
              {name}
            </p>
          </div>
        </div>
      </div>

      <ScrollShadow hideScrollBar className="flex-1 overflow-y-auto">
        <nav className="flex flex-col px-3 py-2 gap-4">
          {visibleSections.map((section, index) => (
            <div
              key={section?.label ? section.label + index : index}
              className="flex flex-col gap-1"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted px-2.5 py-1">
                {section.label}
              </p>
              {section.items.map((item) => (
                <NavGroup
                  key={item.label + item.href}
                  item={item}
                  isAdmin={isAdmin}
                  permissions={permissions}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollShadow>

      <Separator />

      <div className="px-3 py-3 shrink-0 flex flex-col gap-1">
        <Button
          variant="ghost"
          onPress={() => router.push("/dashboard/me")}
          className={[
            "w-full flex justify-start px-4 text-xs transition-colors",
            isPerfilActive
              ? "text-accent font-medium"
              : "text-muted hover:text-foreground hover:bg-default",
          ].join(" ")}
        >
          Perfil
        </Button>

        <Button
          variant="ghost"
          onPress={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center px-4 text-sm text-danger hover:bg-danger/10 w-full justify-start"
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
