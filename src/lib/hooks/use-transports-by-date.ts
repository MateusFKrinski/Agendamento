import { useCallback } from "react";
import { CalendarDate } from "@internationalized/date";
import { listTransports } from "@/actions/transport";
import { calendarDateToString } from "@/lib/utils/date-helpers";
import { useFetch } from "@/lib/hooks/use-fetch";
import { CarIcon, LucideIcon, UsersIcon } from "lucide-react";
import { countPassengers } from "@/lib/utils/count-passengers";

export function useTransportsByDate(selectedDate: CalendarDate) {
  const fetcher = useCallback(
    () => listTransports(1, calendarDateToString(selectedDate), 999),
    [selectedDate],
  );

  const { data, loading, error, refresh } = useFetch(fetcher);

  const transports = data?.success ? data.data.transports : [];
  const activeTransports = transports.filter((t) => !t.isCanceled);
  const canceledTransports = transports.filter((t) => t.isCanceled);
  const hasData = !!data;
  const totalPassengers = activeTransports.reduce(
    (acc, transport) =>
      acc +
      countPassengers(
        transport.appointments.map((a) => ({
          patientId: a.appointment.patient.id,
          hasCompanion: a.appointment.hasCompanion,
          companionId: a.appointment.companion?.id ?? null,
        })),
      ),
    0,
  );

  const metrics: { label: string; value: number; Icon: LucideIcon }[] = hasData
    ? [
        {
          label: `Transporte${activeTransports.length !== 1 ? "s" : ""}`,
          value: activeTransports.length,
          Icon: CarIcon,
        },
        {
          label: `Passageiro${totalPassengers !== 1 ? "s" : ""}`,
          value: totalPassengers,
          Icon: UsersIcon,
        },
        {
          label: `Cancelado${canceledTransports.length !== 1 ? "s" : ""}`,
          value: canceledTransports.length,
          Icon: CarIcon,
        },
      ]
    : [];

  return {
    transports,
    activeTransports,
    canceledTransports,
    totalPassengers,
    loading,
    error,
    refresh,
    hasData: !!data,
    metrics,
  };
}
