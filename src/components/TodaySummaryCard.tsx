"use client";

import { useMemo } from "react";

type Appointment = {
  date: string;
  service: {
    price?: number;
  } | null;
  servicePrice?: number | null;
  payments?: { amount: number; createdAt?: string | Date }[];
};

export default function TodaySummaryCard({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const todayData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todays = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= today && d < tomorrow;
    });

    const totalIncome = appointments.reduce((sum, a) => {
      for (const p of a.payments ?? []) {
        const d = new Date(p.createdAt ?? new Date());
        if (d >= today && d < tomorrow) sum += p.amount;
      }
      return sum;
    }, 0);

    const pending = todays.reduce((sum, a) => {
      const total = a.servicePrice ?? a.service?.price ?? 0;
      const paid = a.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
      return sum + Math.max(total - paid, 0);
    }, 0);

    return {
      count: todays.length,
      income: totalIncome,
      pending,
    };
  }, [appointments]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">Hoy</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold leading-none">
            {todayData.count}
          </p>
          <p className="text-sm text-gray-600">turnos</p>
        </div>

        <div className="text-right space-y-1.5">
          <div>
            <p className="text-xl font-semibold leading-none">
              $ {todayData.income}
            </p>
            <p className="text-xs text-gray-600">cobrado hoy</p>
          </div>
          <div>
            <p className="text-xl font-semibold leading-none">
              $ {todayData.pending}
            </p>
            <p className="text-xs text-gray-600">agendado hoy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
