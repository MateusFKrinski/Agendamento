"use client";

import { FieldError, Label, ListBox, Select } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";

type Option = { label: string; value: string };

type SelectFieldProps = {
  label: string;
  icon?: LucideIcon;
  error?: string;
  variant: "primary" | "secondary";
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
} & Omit<
  ComponentProps<typeof Select>,
  "children" | "placeholder" | "value" | "onChange" | "variant"
>;

export function SelectField({
  label,
  icon: Icon,
  error,
  variant,
  options,
  placeholder,
  value,
  onChange,
  ...props
}: SelectFieldProps) {
  return (
    <Select
      isInvalid={!!error}
      className="w-full"
      placeholder={placeholder}
      value={value}
      onChange={(val) => onChange?.(val as string)}
      variant={variant}
      {...props}
    >
      <Label>{label}</Label>
      <Select.Trigger className={["flex items-center gap-3"].join(" ")}>
        {Icon && <Icon size={16} className="text-muted shrink-0" />}
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((opt) => (
            <ListBox.Item key={opt.value} id={opt.value} textValue={opt.label}>
              {opt.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      <FieldError>{error}</FieldError>
    </Select>
  );
}
