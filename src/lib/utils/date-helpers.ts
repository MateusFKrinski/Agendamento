import { CalendarDate } from "@internationalized/date";

export function calendarDateToString(date: CalendarDate): string {
  return date.toString();
}

export function dateRange(date: string) {
  return {
    gte: new Date(`${date}T00:00:00.000Z`),
    lte: new Date(`${date}T23:59:59.999Z`),
  };
}

export function todayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
