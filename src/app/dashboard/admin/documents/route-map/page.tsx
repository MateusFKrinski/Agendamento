"use client";

import { Chip } from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import { generateRouteMap } from "@/actions/generateDocument";
import { TransportRow } from "@/actions/types/transport";
import { AsyncState } from "@/components/ui/async-state";
import SectionTitle from "@/components/ui/section-title";
import CalendarField from "@/components/ui/calendar-field";
import MetricCard from "@/components/ui/metric-card";
import { downloadFile } from "@/lib/utils/download";
import { formSubmit } from "@/lib/form-submit";
import TransportCard from "@/components/documents/transport-card";
import TemplateKeysHelp from "@/components/documents/template-keys-help";
import { ROUTE_MAP_TEMPLATE_KEYS } from "@/lib/documents/template-keys";
import { useTransportsByDate } from "@/lib/hooks/use-transports-by-date";
import { useCalendarDate } from "@/lib/hooks/use-calendar-date";

export default function Page() {
  const { selectedDate, setSelectedDate, todayDate, isToday } =
    useCalendarDate();

  const { activeTransports, metrics, loading, error, refresh } =
    useTransportsByDate(selectedDate);

  async function handleGenerate(transport: TransportRow) {
    await formSubmit({
      action: () => generateRouteMap({ transportId: transport.id }),
      onSuccess: (result) => {
        const { data } = result as {
          success: true;
          data: { fileData: number[]; fileName: string };
        };
        downloadFile(data.fileData, data.fileName);
      },
    });
  }

  return (
    <div className="w-full flex gap-6 pb-10">
      <div className="flex flex-col gap-4 w-72 shrink-0">
        <CalendarField
          isToday={isToday}
          todayDate={todayDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <AsyncState
          data={metrics}
          loading={loading}
          error={error}
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

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground capitalize">
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
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">
              Selecione um transporte para gerar o mapa de rotas
            </p>
            <TemplateKeysHelp doc={ROUTE_MAP_TEMPLATE_KEYS} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle count={activeTransports.length}>
            Transportes
          </SectionTitle>
          <AsyncState
            data={activeTransports}
            loading={loading}
            error={error}
            onRetry={refresh}
            className="flex justify-left py-6"
            empty={
              <p className="w-full text-sm text-muted text-left">
                Nenhum transporte ativo para esse dia
              </p>
            }
          >
            {(transports) => (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
                }}
              >
                {transports.map((t) => (
                  <TransportCard
                    key={t.id}
                    transport={t}
                    onGenerate={handleGenerate}
                  />
                ))}
              </div>
            )}
          </AsyncState>
        </div>
      </div>
    </div>
  );
}
