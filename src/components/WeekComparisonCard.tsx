"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

type Appointment = {
  date: string;
};

export default function WeekComparisonCard({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const data = useMemo(() => {
    const thisStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const lastStart = startOfWeek(subWeeks(new Date(), 1), {
      weekStartsOn: 1,
    });
    const lastEnd = endOfWeek(subWeeks(new Date(), 1), {
      weekStartsOn: 1,
    });

    const thisWeek = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= thisStart && d <= thisEnd;
    }).length;

    const lastWeek = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= lastStart && d <= lastEnd;
    }).length;

    const diff = thisWeek - lastWeek;

    return { thisWeek, lastWeek, diff };
  }, [appointments]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">
        Comparado con la semana pasada
      </p>

      <p className="text-2xl font-semibold">
        {data.thisWeek} turnos
      </p>

      <p
        className={`text-sm mt-1 ${
          data.diff >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {data.diff >= 0 ? "▲" : "▼"}{" "}
        {Math.abs(data.diff)} turnos
      </p>
    </div>
  );
}
