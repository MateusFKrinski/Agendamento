"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Label, Separator, Switch } from "@heroui/react";
import {
  CalendarIcon,
  ClockIcon,
  LandmarkIcon,
  MapPinIcon,
  BanknoteIcon,
  FileTextIcon,
  DownloadIcon,
} from "lucide-react";
import { generateDaily } from "@/actions/generateDocument";
import { SelectField } from "@/components/ui/select-field";
import { InputTextField } from "@/components/ui/input-text-field";
import { InputDateField } from "@/components/ui/input-date-field";
import { InputMaskField } from "@/components/ui/input-mask-field";
import ButtonField from "@/components/ui/button-field";
import { parseDate } from "@internationalized/date";
import { maskCPF } from "@/lib/utils/masks";
import { TransportRow } from "@/actions/types/transport";
import {
  GenerateDailyFormData,
  generateDailySchema,
} from "@/lib/schemas/daily";
import { formSubmit } from "@/lib/form-submit";
import { downloadFile } from "@/lib/utils/download";
import SectionLabel from "@/components/ui/section-label";

export default function GenerateDailyForm({
  transport,
}: {
  transport: TransportRow;
}) {
  const variant = "secondary";

  const today = new Date().toISOString().split("T")[0];
  const transportDate = new Date(transport.date).toISOString().split("T")[0];

  const destinationCities = Array.from(
    new Set(
      transport.appointments.map(
        (a) =>
          `${a.appointment.healthUnit.address.city}/${a.appointment.healthUnit.address.state}`,
      ),
    ),
  ).map((m) => ({ label: m, value: m }));

  const paymentMethods =
    transport.driver.paymentMethods?.map((pm) => ({
      label: `${pm.label} — ${pm.bankName ?? ""}`,
      value: pm.id,
    })) ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GenerateDailyFormData>({
    resolver: zodResolver(generateDailySchema),
    defaultValues: {
      transportId: transport.id,
      paymentMethodId: paymentMethods[0]?.value ?? "",
      destinationCity: destinationCities[0]?.value ?? "",
      orderDate: today,
      departureDate: transportDate,
      returnDate: transportDate,
      returnTime: "",
      dailyValue: "",
      travelPeriod: "",
      reason: "",
      overnight: false,
    },
  });

  async function onSubmit(data: GenerateDailyFormData) {
    await formSubmit({
      action: () => generateDaily(data),
      successMessage: "Documento gerado com sucesso",
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
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 pb-2.5"
    >
      <div className="flex flex-col gap-3">
        <SectionLabel>Motorista</SectionLabel>
        <div className="px-3 py-2 rounded-xl bg-default flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            {transport.driver.name}
          </p>
          <p className="text-xs text-muted font-mono">
            {maskCPF(transport.driver.cpf)}
          </p>
          {transport.driver.role && (
            <p className="text-xs text-muted">{transport.driver.role}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SectionLabel>Pagamento</SectionLabel>
        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Método de pagamento"
              icon={LandmarkIcon}
              error={errors.paymentMethodId?.message}
              options={paymentMethods}
              value={field.value}
              onChange={field.onChange}
              variant={variant}
            />
          )}
        />
        <Controller
          name="dailyValue"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Valor da diária (R$)"
              placeholder="150,00"
              icon={BanknoteIcon}
              error={errors.dailyValue?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <SectionLabel>Deslocamento</SectionLabel>

        <Controller
          name="destinationCity"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Município de destino"
              icon={MapPinIcon}
              error={errors.destinationCity?.message}
              options={destinationCities}
              value={field.value}
              onChange={field.onChange}
              variant={variant}
            />
          )}
        />

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="departureDate"
            control={control}
            render={({ field }) => (
              <InputDateField
                label="Data de ida"
                icon={CalendarIcon}
                error={errors.departureDate?.message}
                value={field.value ? parseDate(field.value) : null}
                onChange={(val) => field.onChange(val ? val.toString() : "")}
                variant={variant}
              />
            )}
          />
          <Controller
            name="returnDate"
            control={control}
            render={({ field }) => (
              <InputDateField
                label="Data de volta"
                icon={CalendarIcon}
                error={errors.returnDate?.message}
                value={field.value ? parseDate(field.value) : null}
                onChange={(val) => field.onChange(val ? val.toString() : "")}
                variant={variant}
              />
            )}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Controller
            name="orderDate"
            control={control}
            render={({ field }) => (
              <InputDateField
                label="Data do pedido"
                icon={CalendarIcon}
                error={errors.orderDate?.message}
                value={field.value ? parseDate(field.value) : null}
                onChange={(val) => field.onChange(val ? val.toString() : "")}
                variant={variant}
              />
            )}
          />
          <Controller
            name="returnTime"
            control={control}
            render={({ field }) => (
              <InputMaskField
                label="Hora de retorno"
                placeholder="18:00"
                icon={ClockIcon}
                error={errors.returnTime?.message}
                masks={[{ mask: "00:00" }]}
                autoComplete="off"
                variant={variant}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="travelPeriod"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Período de deslocamento"
              placeholder="Ex: 1 diária sem pernoite"
              icon={FileTextIcon}
              error={errors.travelPeriod?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <InputTextField
              label="Motivo"
              placeholder="Descreva o motivo do deslocamento..."
              error={errors.reason?.message}
              autoComplete="off"
              variant={variant}
              {...field}
            />
          )}
        />

        <Controller
          name="overnight"
          control={control}
          render={({ field }) => (
            <Switch isSelected={field.value} onChange={field.onChange}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                <Label>Necessita pernoite</Label>
              </Switch.Content>
            </Switch>
          )}
        />
      </div>

      <ButtonField
        {...{ type: "submit", className: "w-full" }}
        isSubmitting={isSubmitting}
        label="Gerar e baixar diária"
        icon={DownloadIcon}
      />
    </Form>
  );
}
