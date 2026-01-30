"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  addDays,
  isSameDay,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

type Appointment = {
  date: string;
};

export default function WeeklyMiniChart({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const data = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });

    return Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(start, i);
      const count = appointments.filter((a) =>
        isSameDay(new Date(a.date), day)
      ).length;

      return {
        label: format(day, "EEE", { locale: es }),
        count,
      };
    });
  }, [appointments]);

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h3 className="text-sm font-semibold mb-3">
        📊 Turnos de la semana
      </h3>

      <div className="flex items-end gap-2 h-24">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <div
              className="bg-black rounded-lg mx-auto"
              style={{
                height: `${(d.count / max) * 100}%`,
                width: "10px",
              }}
            />
            <p className="text-[10px] mt-1 text-gray-500">
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
