"use client";

import { useMemo } from "react";
import { startOfWeek, endOfWeek } from "date-fns";

type Appointment = {
  date: string;
  service: {
    price?: number;
  } | null;
  servicePrice?: number | null;
};

export default function WeeklySummaryCard({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const data = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weekAppointments = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= start && d <= end;
    });

    const income = weekAppointments.reduce(
      (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
      0
    );

    return {
      count: weekAppointments.length,
      income,
    };
  }, [appointments]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">Esta semana</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold leading-none">
            {data.count}
          </p>
          <p className="text-sm text-gray-600">turnos</p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-semibold leading-none">
            $ {data.income}
          </p>
          <p className="text-sm text-gray-600">ingresos</p>
        </div>
      </div>
    </div>
  );
}
