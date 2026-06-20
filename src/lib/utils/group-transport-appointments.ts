export type GroupedPassenger<
  T extends {
    patient: { id: string; name: string };
    companion: { id: string; name: string } | null;
    hasCompanion: boolean;
  },
> = {
  patient: { id: string; name: string };
  companion: { id: string; name: string } | null;
  hasCompanion: boolean;
  appointments: T[];
};

export function groupTransportAppointments<
  T extends {
    patient: { id: string; name: string };
    companion: { id: string; name: string } | null;
    hasCompanion: boolean;
  },
>(appointments: T[]): GroupedPassenger<T>[] {
  const map = new Map<string, GroupedPassenger<T>>();

  for (const appointment of appointments) {
    const key = appointment.patient.id;
    if (!map.has(key)) {
      map.set(key, {
        patient: appointment.patient,
        companion: appointment.companion,
        hasCompanion: appointment.hasCompanion,
        appointments: [],
      });
    }
    map.get(key)!.appointments.push(appointment);
  }

  return Array.from(map.values());
}
