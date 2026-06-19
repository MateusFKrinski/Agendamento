"use client";

import { FieldError, Label, NumberField } from "@heroui/react";
import { ComponentProps } from "react";

type InputNumberFieldProps = {
  label: string;
  error?: string;
  variant: "primary" | "secondary";
} & Omit<ComponentProps<typeof NumberField>, "children" | "variant">;

export function InputNumberField({
  label,
  error,
  variant,
  ...props
}: InputNumberFieldProps) {
  return (
    <NumberField
      isInvalid={!!error}
      className="w-full"
      {...props}
      variant={variant}
    >
      <Label>{label}</Label>

      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
      <FieldError>{error}</FieldError>
    </NumberField>
  );
}
