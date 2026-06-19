"use client";

import {
  ComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ScrollShadow,
} from "@heroui/react";
import { InboxIcon } from "lucide-react";

export type SearchSelectOption = {
  label: string;
  value: string;
  description?: string;
};

type SearchSelectFieldProps = {
  label: string;
  placeholder?: string;
  error?: string;
  variant?: "primary" | "secondary";
  options: SearchSelectOption[];
  value?: string;
  onChangeAction?: (value: string) => void;
  emptyMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
};

export function SearchSelectField({
  label,
  placeholder,
  error,
  variant,
  options,
  value,
  onChangeAction,
  emptyMessage = "Nenhum resultado encontrado",
  isDisabled,
  isRequired,
}: SearchSelectFieldProps) {
  return (
    <ComboBox
      isInvalid={!!error}
      isDisabled={isDisabled}
      isRequired={isRequired}
      className="w-full"
      variant={variant}
      value={value}
      onChange={(key) => onChangeAction?.(key as string)}
      menuTrigger="focus"
      allowsEmptyCollection
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input placeholder={placeholder} />

        <ComboBox.Trigger />
      </ComboBox.InputGroup>

      <ComboBox.Popover style={{ scrollbarWidth: "none" }}>
        <ScrollShadow
          hideScrollBar
          className="max-h-60 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <ListBox
            items={options}
            renderEmptyState={() => (
              <div className="flex flex-col items-center gap-2 py-6 text-muted">
                <InboxIcon size={20} />
                <span className="text-xs">{emptyMessage}</span>
              </div>
            )}
          >
            {(opt) => (
              <ListBox.Item
                key={opt.value}
                id={opt.value}
                textValue={opt.label}
              >
                <div className="flex flex-col py-0.5">
                  <span className="text-sm text-foreground">{opt.label}</span>
                  {opt.description && (
                    <span className="text-xs text-muted">
                      {opt.description}
                    </span>
                  )}
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </ListBox>
        </ScrollShadow>
      </ComboBox.Popover>

      <FieldError>{error}</FieldError>
    </ComboBox>
  );
}
