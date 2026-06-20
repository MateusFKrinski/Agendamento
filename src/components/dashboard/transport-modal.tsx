import { maskPlate } from "@/lib/utils/masks";
import { Chip, Modal } from "@heroui/react";
import { ClockIcon, StickyNoteIcon } from "lucide-react";
import CancelBadge from "./cancel-badge";
import { TransportRow } from "@/actions/types/dashboard";
import { countPassengers } from "@/lib/utils/count-passengers";
import { groupTransportAppointments } from "@/lib/utils/group-transport-appointments";

export default function TransportModal({
  transport,
}: {
  transport: TransportRow;
}) {
  const totalPassengers = countPassengers(
    transport.appointments.map((a) => ({
      patientId: a.appointment.patient.id,
      hasCompanion: a.appointment.hasCompanion,
      companionId: a.appointment.companion?.id ?? null,
    })),
  );
  const groupedByPatient = groupTransportAppointments(
    transport.appointments.map((a) => a.appointment),
  );
  const availableSeats = transport.vehicle.capacity - 1;
  const isFull = totalPassengers >= availableSeats;

  return (
    <Modal>
      <Modal.Trigger>
        <button className="w-full text-left" style={{ cursor: "pointer" }}>
          <div
            className={[
              "flex flex-col gap-2 px-4 py-3 rounded-2xl border transition-all",
              transport.isCanceled
                ? "border-danger/20 bg-danger/5 opacity-60"
                : "border-border bg-background hover:border-accent/30 hover:bg-accent/5",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "text-sm font-medium font-mono",
                    transport.isCanceled
                      ? "text-muted line-through"
                      : "text-foreground",
                  ].join(" ")}
                >
                  {maskPlate(transport.vehicle.plate)}
                </span>
                <span className="text-xs text-muted">
                  {transport.vehicle.brand} {transport.vehicle.model}
                </span>
              </div>
              <div className="flex items-center shrink-0">
                {transport.isCanceled ? (
                  <Chip size="sm" color="danger">
                    Cancelado
                  </Chip>
                ) : (
                  <Chip size="sm" color="success">
                    Ativo
                  </Chip>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <ClockIcon size={10} />
                {transport.departureTime}
              </span>
              <span>{transport.driver.name}</span>
              <span
                className={
                  isFull
                    ? "text-danger font-medium"
                    : "text-foreground font-medium"
                }
              >
                {totalPassengers}/{availableSeats} vagas
              </span>
            </div>

            {transport.observations && (
              <div className="flex items-start gap-1.5 text-xs text-muted">
                <StickyNoteIcon size={12} className="shrink-0 mt-0.5" />
                <span className="line-clamp-2 text-left">
                  {transport.observations}
                </span>
              </div>
            )}
          </div>
        </button>
      </Modal.Trigger>

      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog className="max-h-10/12">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {maskPlate(transport.vehicle.plate)} — {transport.vehicle.brand}{" "}
                {transport.vehicle.model}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  <Chip
                    size="sm"
                    color={transport.isCanceled ? "danger" : "success"}
                  >
                    {transport.isCanceled ? "Cancelado" : "Ativo"}
                  </Chip>
                  <Chip size="sm" color={isFull ? "danger" : "default"}>
                    {totalPassengers}/{availableSeats} vagas
                  </Chip>
                </div>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Saída
                    </p>
                    <p className="text-sm text-foreground">
                      {transport.departureTime}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      Motorista
                    </p>
                    <p className="text-sm text-foreground">
                      {transport.driver.name}
                    </p>
                  </div>
                </div>

                {transport.observations && (
                  <div className="flex flex-col gap-1 px-3 py-2 rounded-2xl bg-default">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted">
                      <StickyNoteIcon size={12} />
                      Observação
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {transport.observations}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted">
                    Passageiros — {transport.appointments.length} agendamento
                    {transport.appointments.length !== 1 ? "s" : ""}
                  </p>

                  {Object.values(groupedByPatient).map((group) => (
                    <div
                      key={group.patient.id}
                      className="flex flex-col gap-1 px-3 py-2 rounded-2xl bg-default"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {group.patient.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 mt-1">
                        {group.appointments.map((a, i) => (
                          <div
                            key={i}
                            className="grid items-start gap-3 text-xs text-muted"
                            style={{
                              gridTemplateColumns: "35px 75px 1fr auto",
                            }}
                          >
                            <span className="truncate">{a.time}</span>
                            <span className="truncate">
                              {a.healthSpecialty.name}
                            </span>
                            <span className="truncate">
                              {a.healthUnit.unitName}
                            </span>
                            {a.hasCompanion && a.companion ? (
                              <Chip size="sm" color="default">
                                + {a.companion.name.split(" ")[0]}
                              </Chip>
                            ) : (
                              <span />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {transport.isCanceled && (
                  <>
                    <CancelBadge
                      reason={transport.cancelReason}
                      by={transport.canceledBy}
                      at={transport.canceledAt}
                    />
                  </>
                )}

                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted">
                    Criado por
                  </p>
                  <p className="text-sm text-foreground">
                    {transport.createdBy.name}
                  </p>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
