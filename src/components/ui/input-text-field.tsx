"use client";

import { FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";

type InputTextFieldProps = {
  label: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  variant: "primary" | "secondary";
} & ComponentProps<typeof InputGroup.Input>;

export function InputTextField({
  label,
  placeholder,
  icon: Icon,
  error,
  variant,
  ...props
}: InputTextFieldProps) {
  return (
    <TextField isInvalid={!!error} className="w-full" variant={variant}>
      <Label>{label}</Label>
      <InputGroup>
        {Icon && (
          <InputGroup.Prefix>
            <Icon size={16} className="text-muted" />
          </InputGroup.Prefix>
        )}
        <InputGroup.Input placeholder={placeholder} {...props} />
      </InputGroup>
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
