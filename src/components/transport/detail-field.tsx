import React from "react";

export default function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
