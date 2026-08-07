"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";

type Appointment = {
  date: string;
  service?: { price?: number } | null;
  servicePrice?: number | null;
};

export default function MonthlyGrowthBadge({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const now = new Date();

  const calcTotal = (start: Date, end: Date) =>
    appointments
      .filter((a) =>
        isWithinInterval(new Date(a.date), { start, end })
      )
      .reduce(
        (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
        0
      );

  const current = useMemo(
    () => calcTotal(startOfMonth(now), endOfMonth(now)),
    [appointments]
  );

  const prevDate = subMonths(now, 1);

  const previous = useMemo(
    () =>
      calcTotal(
        startOfMonth(prevDate),
        endOfMonth(prevDate)
      ),
    [appointments]
  );

  if (!previous) {
    return (
      <p className="text-xs text-gray-400">
        Sin datos del mes anterior
      </p>
    );
  }

  const diff = ((current - previous) / previous) * 100;

  const emoji =
    diff > 10 ? "🔥" : diff > 0 ? "📈" : diff < 0 ? "📉" : "➖";

  return (
    <p className="text-sm font-medium">
      {emoji} {diff.toFixed(1)}% vs mes anterior
    </p>
  );
}
