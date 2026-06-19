"use client";

import { FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";
import { useMaskInput } from "@/lib/hooks/use-mask";

export type MaskDefinition = {
  mask: string;
  replacement?: Record<string, RegExp>;
};

type InputMaskFieldProps = {
  label: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  variant: "primary" | "secondary";
  masks: MaskDefinition[];
} & Omit<ComponentProps<typeof InputGroup.Input>, "ref">;

export function InputMaskField({
  label,
  placeholder,
  icon: Icon,
  error,
  variant,
  masks,
  onChange,
  ...props
}: InputMaskFieldProps) {
  const { inputRef, handleChange } = useMaskInput(masks);

  return (
    <TextField isInvalid={!!error} className="w-full">
      <Label>{label}</Label>
      <InputGroup variant={variant}>
        {Icon && (
          <InputGroup.Prefix>
            <Icon size={16} className="text-muted" />
          </InputGroup.Prefix>
        )}
        <InputGroup.Input
          ref={inputRef}
          placeholder={placeholder}
          onChange={(e) => handleChange(e, onChange)}
          {...props}
        />
      </InputGroup>
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
