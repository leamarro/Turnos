"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";

type Appointment = {
  id: string;
  date: string;
  name?: string | null;
  lastName?: string | null;
  service?: {
    name: string;
  } | null;
};

export default function TodayNextAppointments({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const list = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((a) => {
        const d = new Date(a.date);
        return isSameDay(d, now) && d >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 3);
  }, [appointments]);

  if (list.length === 0) {
    return (
      <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 shadow-sm dark:border dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay más turnos hoy
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl p-5 shadow-sm space-y-3 dark:border dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Próximos turnos hoy
      </p>

      {list.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {a.name} {a.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {a.service?.name}
            </p>
          </div>

          <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
            {format(new Date(a.date), "HH:mm")}
          </p>
        </div>
      ))}
    </div>
  );
}
