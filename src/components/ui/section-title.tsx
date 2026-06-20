import { Chip } from "@heroui/react";

export default function SectionTitle({
  children,
  count,
  danger,
}: {
  children: string;
  count?: number;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <p
        className={[
          "text-[10px] uppercase tracking-widest font-medium",
          danger ? "text-danger" : "text-muted",
        ].join(" ")}
      >
        {children}
      </p>
      <Chip color={danger ? "danger" : "default"} variant="primary">
        {count}
      </Chip>
    </div>
  );
}
