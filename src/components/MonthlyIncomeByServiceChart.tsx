"use client";

import { useMemo } from "react";
import { formatMoney as money } from "@/lib/format";

type Appointment = {
  date: string;
  service: { name: string; price?: number; color?: string } | null;
  servicePrice?: number | null;
  payments?: { amount: number; createdAt?: string | Date }[];
};

function monthLong(key: string) {
  const [year, month] = key.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MonthlyIncomeByServiceChart({
  data,
  selectedYear,
  selectedMonth,
}: {
  data: Appointment[];
  selectedYear: number;
  selectedMonth: string | null;
}) {
  const { chartData, total } = useMemo(() => {
    const map = new Map<
      string,
      { name: string; color: string; total: number; count: number }
    >();

    data.forEach((appointment) => {
      const name = appointment.service?.name ?? "Sin servicio";
      const color = appointment.service?.color ?? "#6b7280";

      for (const payment of appointment.payments ?? []) {
        const date = new Date(payment.createdAt ?? new Date());
        const matches = selectedMonth
          ? date.getFullYear() === selectedYear &&
            date.getMonth() + 1 === Number(selectedMonth.slice(5, 7))
          : date.getFullYear() === selectedYear;

        if (!matches) continue;

        const entry =
          map.get(name) ?? { name, color, total: 0, count: 0 };
        entry.total += payment.amount;
        entry.count += 1;
        map.set(name, entry);
      }
    });

    const list = [...map.values()]
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      chartData: list,
      total: list.reduce((sum, entry) => sum + entry.total, 0),
    };
  }, [data, selectedYear, selectedMonth]);

  const periodLabel = selectedMonth
    ? monthLong(selectedMonth)
    : `Año ${selectedYear}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-semibold dark:text-white">
          Ingresos por servicio
        </p>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
          {periodLabel}
        </span>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Sin ingresos en {periodLabel.toLowerCase()}
        </p>
      ) : (
        <div className="space-y-3">
          {chartData.map((item) => {
            const pct = total > 0 ? (item.total / total) * 100 : 0;

            return (
              <div key={item.name}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.name}
                    <span className="ml-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                      ×{item.count}
                    </span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-white shrink-0">
                    {money(item.total)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(pct, 1)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
