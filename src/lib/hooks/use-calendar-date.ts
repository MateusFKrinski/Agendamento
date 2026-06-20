import { useState } from "react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";

export function useCalendarDate() {
  const todayDate = today(getLocalTimeZone());
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(todayDate);
  const isToday = selectedDate.compare(todayDate) === 0;

  return { selectedDate, setSelectedDate, todayDate, isToday };
}
