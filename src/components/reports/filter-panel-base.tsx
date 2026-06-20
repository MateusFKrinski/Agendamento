"use client";

import { Button, Chip, Popover } from "@heroui/react";
import { FilterIcon, XIcon } from "lucide-react";
import React from "react";

export type FilterChip<T> = { label: string; key: keyof T };

interface ActiveFiltersProps<T> {
  chips: FilterChip<T>[];
  onClear: (key: keyof T) => void;
}

export function ActiveFilters<T>({ chips, onClear }: ActiveFiltersProps<T>) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Chip
          key={String(chip.key)}
          size="sm"
          color="accent"
          variant="primary"
          onClick={() => onClear(chip.key)}
          className="flex items-center justify-center px-2"
          style={{ cursor: "pointer" }}
        >
          <XIcon size={12} className="mr-1" />
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}

interface FilterPanelBaseProps {
  hasFilters: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onClearAll: () => void;
  width?: number;
  children: React.ReactNode;
  activeFilters: React.ReactNode;
}

export function FilterPanelBase({
  hasFilters,
  open,
  onOpenChange,
  onClearAll,
  width = 520,
  children,
  activeFilters,
}: FilterPanelBaseProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Popover isOpen={open} onOpenChange={onOpenChange}>
        <Popover.Trigger>
          <Button size="sm" variant={open ? "primary" : "secondary"}>
            <FilterIcon size={14} />
            Filtros
          </Button>
          {hasFilters && (
            <Button size="sm" variant="ghost" onPress={onClearAll}>
              <XIcon size={14} />
              Limpar filtros
            </Button>
          )}
        </Popover.Trigger>

        <Popover.Content
          placement="bottom start"
          className="p-4"
          style={{ width }}
        >
          {children}
        </Popover.Content>
      </Popover>

      {activeFilters}
    </div>
  );
}
