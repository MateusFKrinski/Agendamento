import { UserXIcon, XCircleIcon } from "lucide-react";

export default function CancelBadge({
  reason,
  by,
  at,
}: {
  reason: string | null;
  by: { name: string } | null;
  at: Date | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <XCircleIcon size={13} className="text-danger shrink-0" />
        <p className="text-[10px] font-medium text-danger uppercase tracking-widest">
          Cancelado
        </p>
      </div>
      {reason && <p className="text-sm text-muted">{reason}</p>}
      <div className="flex items-center gap-3 text-xs text-muted">
        {by && (
          <span className="flex items-center gap-1">
            <UserXIcon size={12} />
            {by.name}
          </span>
        )}
        {at && <span>{new Date(at).toLocaleDateString("pt-BR")}</span>}
      </div>
    </div>
  );
}
