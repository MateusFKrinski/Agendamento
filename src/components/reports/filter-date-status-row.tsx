import { Controller, Control, FieldErrors } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { InputDateField } from "@/components/ui/input-date-field";
import { SelectField } from "@/components/ui/select-field";
import { parseDate } from "@internationalized/date";

type SelectOption = { label: string; value: string };

interface FilterDateStatusRowProps<
  T extends { dateFrom?: string; dateTo?: string; status?: string },
> {
  control: Control<T>;
  errors: FieldErrors<T>;
  statusOptions: SelectOption[];
}

export function FilterDateStatusRow<
  T extends { dateFrom?: string; dateTo?: string; status?: string },
>({ control, errors, statusOptions }: FilterDateStatusRowProps<T>) {
  return (
    <div
      className="w-full grid gap-3"
      style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
    >
      <Controller
        name={"dateFrom" as any}
        control={control as any}
        render={({ field }) => (
          <InputDateField
            label="Data inicial"
            icon={CalendarIcon}
            error={(errors as any).dateFrom?.message}
            value={field.value ? parseDate(field.value) : null}
            onChange={(val) => field.onChange(val ? val.toString() : undefined)}
            variant="secondary"
          />
        )}
      />
      <Controller
        name={"dateTo" as any}
        control={control as any}
        render={({ field }) => (
          <InputDateField
            label="Data final"
            icon={CalendarIcon}
            error={(errors as any).dateTo?.message}
            value={field.value ? parseDate(field.value) : null}
            onChange={(val) => field.onChange(val ? val.toString() : undefined)}
            variant="secondary"
          />
        )}
      />
      <Controller
        name={"status" as any}
        control={control as any}
        render={({ field }) => (
          <SelectField
            label="Status"
            options={statusOptions}
            value={field.value ?? ""}
            onChange={(val) => field.onChange(val || undefined)}
            variant="secondary"
          />
        )}
      />
    </div>
  );
}
