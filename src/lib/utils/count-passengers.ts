export type PassengerInput = {
  patientId: string;
  hasCompanion: boolean;
  companionId: string | null | undefined;
};

export function toPassengerInput(appointment: {
  patient: { id: string };
  companion: { id: string } | null;
  hasCompanion: boolean;
}): PassengerInput {
  return {
    patientId: appointment.patient.id,
    hasCompanion: appointment.hasCompanion,
    companionId: appointment.companion?.id ?? null,
  };
}

export function countPassengers(appointments: PassengerInput[]): number {
  const patients = new Set(appointments.map((a) => a.patientId));
  const companions = new Set(
    appointments
      .filter((a) => a.hasCompanion && a.companionId)
      .map((a) => a.companionId as string)
      .filter((id) => !patients.has(id)),
  );

  return patients.size + companions.size;
}
