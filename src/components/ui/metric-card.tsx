import { LucideIcon } from "lucide-react";

export default function MetricCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-background">
      <div className="shrink-0text-muted">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex items-center gap-2">
        <p className="font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
