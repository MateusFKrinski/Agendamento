import { Button, Calendar } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { Dispatch, SetStateAction } from "react";

export default function CalendarField({
  selectedDate,
  setSelectedDate,
  isToday,
  todayDate,
}: {
  selectedDate: CalendarDate;
  setSelectedDate: Dispatch<SetStateAction<CalendarDate>>;
  isToday: boolean;
  todayDate: CalendarDate;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <Calendar
        aria-label="Selecionar data"
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as CalendarDate)}
      >
        <Calendar.Header>
          <Calendar.Heading />
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => <Calendar.Cell date={date} />}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>

      {!isToday && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-2 text-accent text-xs"
          onPress={() => setSelectedDate(todayDate)}
        >
          Ir para hoje
        </Button>
      )}
    </div>
  );
}
