"use client";

import {
  FieldError,
  InputGroup,
  Label,
  TextField,
  Button,
} from "@heroui/react";
import { LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { ComponentProps, useState } from "react";

type InputPasswordFieldProps = {
  label: string;
  placeholder?: string;
  error?: string;
  variant: "primary" | "secondary";
} & Omit<ComponentProps<typeof InputGroup.Input>, "type">;

export function InputPasswordField({
  label,
  placeholder,
  error,
  variant,
  ...props
}: InputPasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <TextField isInvalid={!!error} className="w-full" variant={variant}>
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <LockIcon size={16} className="text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...props}
        />
        <InputGroup.Suffix>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => setShow((p) => !p)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="text-muted hover:text-foreground"
          >
            {show ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
