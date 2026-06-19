"use client";

import { DateField, FieldError, Label } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";

type InputDateFieldProps = {
  label: string;
  icon?: LucideIcon;
  error?: string;
  variant: "primary" | "secondary";
} & ComponentProps<typeof DateField>;

export function InputDateField({
  label,
  icon: Icon,
  error,
  variant,
  ...props
}: InputDateFieldProps) {
  return (
    <DateField isInvalid={!!error} className="w-full" {...props}>
      <Label>{label}</Label>
      <DateField.Group variant={variant}>
        {Icon && (
          <div className="pl-3 flex items-center">
            <Icon size={16} className="text-muted" />
          </div>
        )}
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.Group>
      <FieldError>{error}</FieldError>
    </DateField>
  );
}
