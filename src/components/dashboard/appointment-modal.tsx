import { Chip, Modal } from "@heroui/react";
import { ClockIcon } from "lucide-react";
import CancelBadge from "./cancel-badge";
import { AppointmentRow } from "@/actions/types/dashboard";

export default function AppointmentModal({
  appointment,
}: {
  appointment: AppointmentRow;
}) {
  const isSchedule = appointment.transports.length > 0;

  return (
    <Modal>
      <Modal.Trigger>
        <button
          className="w-full text-left group"
          style={{ cursor: "pointer" }}
        >
          <div
            className={[
              "flex flex-col gap-1.5 px-4 py-3 rounded-2xl border transition-all",
              appointment.isCanceled
                ? "border-danger/20 bg-danger/5 opacity-60"
                : "border-border bg-background hover:border-accent/30 hover:bg-accent/5",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={[
                  "text-sm font-medium truncate",
                  appointment.isCanceled
                    ? "text-muted line-through"
                    : "text-foreground",
                ].join(" ")}
              >
                {appointment.patient.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {appointment.isCanceled ? (
                  <Chip size="sm" color="danger">
                    Cancelado
                  </Chip>
                ) : isSchedule ? (
                  <Chip size="sm" color="success">
                    Escalado
                  </Chip>
                ) : (
                  <Chip size="sm" color="warning">
                    Pendente
                  </Chip>
                )}
                {appointment.hasCompanion && !appointment.isCanceled && (
                  <Chip size="sm" color="accent">
                    +1
                  </Chip>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <ClockIcon size={10} />
                {appointment.time}
              </span>
              <span className="truncate">
                {appointment.healthSpecialty.name}
              </span>
              <span className="truncate">
                {appointment.healthUnit.unitName}
              </span>
            </div>
          </div>
        </button>
      </Modal.Trigger>

      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{appointment.patient.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {appointment.isCanceled ? (
                    <Chip size="sm" color="danger">
                      Cancelado
                    </Chip>
                  ) : isSchedule ? (
                    <Chip size="sm" color="success">
                      Escalado
                    </Chip>
                  ) : (
                    <Chip size="sm" color="warning">
                      Pendente de transporte
                    </Chip>
                  )}
                  {appointment.hasCompanion && (
                    <Chip size="sm" color="accent">
                      Com acompanhante
                    </Chip>
                  )}
                </div>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Horário
                    </p>
                    <p className="text-sm text-foreground">
                      {appointment.time}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Especialidade
                    </p>
                    <p className="text-sm text-foreground">
                      {appointment.healthSpecialty.name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Unidade
                    </p>
                    <p className="text-sm text-foreground">
                      {appointment.healthUnit.unitName}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Local de espera
                    </p>
                    <p className="text-sm text-foreground">
                      {appointment.waitingPlace.name}
                    </p>
                  </div>
                </div>

                {appointment.hasCompanion && appointment.companion && (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted">
                        Acompanhante
                      </p>
                      <p className="text-sm text-foreground">
                        {appointment.companion.name}
                      </p>
                    </div>
                  </>
                )}

                {appointment.observations && (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted">
                        Observações
                      </p>
                      <p className="text-sm text-muted">
                        {appointment.observations}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted">
                    Cadastrado por
                  </p>
                  <p className="text-sm text-foreground">
                    {appointment.createdBy.name}
                  </p>
                </div>

                {appointment.isCanceled && (
                  <>
                    <CancelBadge
                      reason={appointment.cancelReason}
                      by={appointment.canceledBy}
                      at={appointment.canceledAt}
                    />
                  </>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
