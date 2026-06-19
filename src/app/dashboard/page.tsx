"use client";

import { useEffect, useState, useCallback } from "react";
import { Chip, Separator } from "@heroui/react";
import {
  CalendarIcon,
  TruckIcon,
  AlertCircleIcon,
  LucideIcon,
} from "lucide-react";
import { getLocalTimeZone } from "@internationalized/date";
import { getDashboardData } from "@/actions/dashboard";
import AppointmentModal from "@/components/dashboard/appointment-modal";
import TransportModal from "@/components/dashboard/transport-modal";
import { AsyncState } from "@/components/ui/async-state";
import MetricCard from "@/components/ui/metric-card";
import SectionTitle from "@/components/ui/section-title";
import { calendarDateToString } from "@/lib/utils/date-helpers";
import { DashboardData } from "@/actions/types/dashboard";
import CalendarField from "@/components/ui/calendar-field";
import { useCalendarDate } from "@/lib/hooks/use-calendar-date";

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedDate, setSelectedDate, todayDate, isToday } =
    useCalendarDate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDashboardData(calendarDateToString(selectedDate));
    if (!result.success) {
      setError(result.error);
    } else {
      setData(result.data);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    load().then();
  }, [load]);

  const activeAppointments =
    data?.appointments.filter((a) => !a.isCanceled) ?? [];
  const canceledAppointments =
    data?.appointments.filter((a) => a.isCanceled) ?? [];
  const activeTransports = data?.transports.filter((t) => !t.isCanceled) ?? [];
  const canceledTransports = data?.transports.filter((t) => t.isCanceled) ?? [];
  const metrics: { label: string; value: number; Icon: LucideIcon }[] = data
    ? [
        {
          label: "Agendamentos",
          value: data.metrics.appointmentsToday,
          Icon: CalendarIcon,
        },
        {
          label: "Pendentes de transporte",
          value: data.metrics.appointmentsPending,
          Icon: AlertCircleIcon,
        },
        {
          label: "Transportes",
          value: data.metrics.transportsToday,
          Icon: TruckIcon,
        },
      ]
    : [];

  return (
    <div className="w-full flex gap-6 pb-10">
      <div className="flex flex-col gap-4 w-72 shrink-0">
        <CalendarField
          isToday={isToday}
          todayDate={todayDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <div className="flex flex-col gap-2">
          <AsyncState
            data={metrics}
            loading={loading}
            error={error}
            onRetry={load}
            className="flex justify-center"
            empty={null}
          >
            {(metrics) => (
              <div className="flex flex-col gap-2">
                {metrics.map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    Icon={m.Icon}
                  />
                ))}
              </div>
            )}
          </AsyncState>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              {selectedDate
                .toDate(getLocalTimeZone())
                .toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </h1>
            {isToday && (
              <Chip color="accent" variant="primary">
                hoje
              </Chip>
            )}
          </div>
          <p className="text-sm text-muted">Visão geral do sistema</p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="flex flex-col gap-3">
            <SectionTitle count={activeAppointments.length}>
              Agendamentos
            </SectionTitle>

            <AsyncState
              data={activeAppointments}
              loading={loading}
              error={error}
              onRetry={load}
              className="flex justify-left py-6"
              empty={
                <p className="w-full text-sm text-muted text-left">
                  Nenhum agendamento para esse dia
                </p>
              }
            >
              {(activeAppointments) =>
                activeAppointments.map((a) => (
                  <AppointmentModal key={a.id} appointment={a} />
                ))
              }
            </AsyncState>
          </div>

          <div className="flex flex-col gap-3">
            <SectionTitle count={activeTransports.length}>
              Transportes
            </SectionTitle>

            <AsyncState
              data={activeTransports}
              loading={loading}
              error={error}
              onRetry={load}
              className="flex justify-left py-6"
              empty={
                <p className="w-full text-sm text-muted text-left">
                  Nenhum transporte para esse dia
                </p>
              }
            >
              {(activeTransports) =>
                activeTransports.map((t) => (
                  <TransportModal key={t.id} transport={t} />
                ))
              }
            </AsyncState>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="flex flex-col gap-3">
            <SectionTitle count={canceledAppointments.length} danger>
              Agendamentos cancelados
            </SectionTitle>

            <AsyncState
              data={canceledAppointments}
              loading={loading}
              error={error}
              onRetry={load}
              className="flex justify-left py-6"
              empty={
                <p className="w-full text-sm text-muted text-left">
                  Nenhum agendamento cancelado para esse dia
                </p>
              }
            >
              {(canceledAppointments) =>
                canceledAppointments.map((a) => (
                  <AppointmentModal key={a.id} appointment={a} />
                ))
              }
            </AsyncState>
          </div>

          <div className="flex flex-col gap-3">
            <SectionTitle count={canceledTransports.length} danger>
              Transportes cancelados
            </SectionTitle>

            <AsyncState
              data={canceledTransports}
              loading={loading}
              error={error}
              onRetry={load}
              className="flex justify-left py-6"
              empty={
                <p className="w-full text-sm text-muted text-left">
                  Nenhum transporte cancelado para esse dia
                </p>
              }
            >
              {(canceledTransports) =>
                canceledTransports.map((t) => (
                  <TransportModal key={t.id} transport={t} />
                ))
              }
            </AsyncState>
          </div>
        </div>
      </div>
    </div>
  );
}
