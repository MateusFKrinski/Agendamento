import { Chip, Checkbox, CheckboxGroup } from "@heroui/react";
import type { PendingAppointmentRow } from "@/actions/types/transport";
import { maskCPF } from "@/lib/utils/masks";
import {
  countPassengers,
  toPassengerInput,
  type PassengerInput,
} from "@/lib/utils/count-passengers";

interface AppointmentCheckboxListProps {
  appointments: PendingAppointmentRow[];
  value: string[];
  onChange: (value: string[]) => void;
  availableSeats: number;
  baseAppointments?: PassengerInput[];
  hasVehicle?: boolean;
}

export function AppointmentCheckboxList({
  appointments,
  value,
  onChange,
  availableSeats,
  baseAppointments = [],
  hasVehicle = true,
}: AppointmentCheckboxListProps) {
  const groupedByUnit = appointments.reduce(
    (acc, appointment) => {
      const key = appointment.healthUnit.id;
      if (!acc[key])
        acc[key] = { healthUnit: appointment.healthUnit, appointments: [] };
      acc[key].appointments.push(appointment);
      return acc;
    },
    {} as Record<
      string,
      {
        healthUnit: PendingAppointmentRow["healthUnit"];
        appointments: PendingAppointmentRow[];
      }
    >,
  );

  const marginalSeats = (appointment: PendingAppointmentRow) => {
    const others = appointments
      .filter((a) => a.id !== appointment.id && value.includes(a.id))
      .map(toPassengerInput);
    const without = [...baseAppointments, ...others];
    return (
      countPassengers([...without, toPassengerInput(appointment)]) -
      countPassengers(without)
    );
  };

  const formatAddress = (
    address: PendingAppointmentRow["healthUnit"]["address"],
  ) => {
    const complement = address.complement ? `, ${address.complement}` : "";
    return `${address.street}, ${address.number}${complement} - ${address.district}, ${address.city}/${address.state}`;
  };

  const selectedInputs = appointments
    .filter((a) => value.includes(a.id))
    .map(toPassengerInput);
  const occupied = countPassengers([...baseAppointments, ...selectedInputs]);
  const remainingSeats = availableSeats - occupied;

  return (
    <CheckboxGroup
      value={value}
      onChange={onChange}
      className="flex flex-col gap-4"
    >
      {Object.values(groupedByUnit).map(
        ({ healthUnit, appointments: unitAppointments }) => (
          <div key={healthUnit.id} className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {healthUnit.unitName}
              </span>
              <span className="text-xs text-muted">
                {formatAddress(healthUnit.address)}
              </span>
            </div>

            <div className="flex flex-col gap-2 pl-3 border-l border-default">
              {unitAppointments.map((appointment) => {
                const isSelected = value.includes(appointment.id);
                const seats = marginalSeats(appointment);
                const wouldExceed =
                  !isSelected && hasVehicle && seats > remainingSeats;

                return (
                  <Checkbox
                    key={appointment.id}
                    value={appointment.id}
                    isDisabled={wouldExceed}
                  >
                    <Checkbox.Control className="bg-default">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {appointment.patient.name}
                          </span>
                          <span className="text-xs text-muted font-mono">
                            {maskCPF(appointment.patient.cpf)}
                          </span>
                          {appointment.hasCompanion &&
                            appointment.companion && (
                              <Chip size="sm" color="default">
                                + {appointment.companion.name.split(" ")[0]}
                              </Chip>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                          <span>{appointment.time}</span>
                          <span>{appointment.healthSpecialty.name}</span>
                          <span>{appointment.waitingPlace.name}</span>
                          <span>
                            {seats === 0
                              ? "já a bordo"
                              : `${seats} vaga${seats !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>
                    </Checkbox.Content>
                  </Checkbox>
                );
              })}
            </div>
          </div>
        ),
      )}
    </CheckboxGroup>
  );
}
