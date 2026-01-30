"use client";

import { useMemo } from "react";
import { startOfWeek, endOfWeek } from "date-fns";

type Appointment = {
  date: string;
  service: {
    name: string;
  } | null;
};

export default function TopServiceWeekCard({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const top = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const acc: Record<string, number> = {};

    appointments.forEach((a) => {
      const d = new Date(a.date);
      if (d < start || d > end) return;

      const name = a.service?.name ?? "Sin servicio";
      acc[name] = (acc[name] ?? 0) + 1;
    });

    const sorted = Object.entries(acc).sort((a, b) => b[1] - a[1]);

    return sorted[0];
  }, [appointments]);

  if (!top) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          No hay datos esta semana
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">
        Lo más pedido esta semana
      </p>

      <p className="text-xl font-semibold leading-tight">
        {top[0]}
      </p>

      <p className="text-sm text-gray-600 mt-1">
        {top[1]} turnos
      </p>
    </div>
  );
}
