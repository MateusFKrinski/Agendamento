export function countPassengers(
  appointments: {
    patientId: string;
    hasCompanion: boolean;
    companionId: string | null | undefined;
  }[],
): number {
  const patients = new Set(appointments.map((a) => a.patientId));
  const companions = new Set(
    appointments
      .filter((a) => a.hasCompanion && a.companionId)
      .map((a) => a.companionId as string)
      .filter((id) => !patients.has(id)),
  );

  return patients.size + companions.size;
}
