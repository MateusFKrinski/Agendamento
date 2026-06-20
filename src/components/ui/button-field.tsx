import { Button, Spinner } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import React from "react";

type ButtonFieldProps = {
  isSubmitting: boolean;
  label?: string;
  icon?: LucideIcon;
};

export default function ButtonField({
  isSubmitting,
  label,
  icon: Icon,
  ...props
}: ButtonFieldProps) {
  return (
    <Button isDisabled={isSubmitting} {...props}>
      {isSubmitting ? (
        <>
          <Spinner className="text-accent-foreground" />
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {label}
        </>
      )}
    </Button>
  );
}
