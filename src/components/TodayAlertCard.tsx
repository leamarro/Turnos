"use client";

import { useMemo } from "react";
import { isSameDay } from "date-fns";

type Appointment = {
  date: string;
};

export default function TodayAlertCard({
  appointments,
  limit = 6,
}: {
  appointments: Appointment[];
  limit?: number;
}) {
  const todayCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((a) =>
      isSameDay(new Date(a.date), today)
    ).length;
  }, [appointments]);

  if (todayCount < limit) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
      <p className="text-sm font-semibold text-red-700">
        ⚠️ Día cargado
      </p>
      <p className="text-xs text-red-600 mt-1">
        Hoy tenés {todayCount} turnos programados
      </p>
    </div>
  );
}
