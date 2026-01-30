"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Appointment = {
  date: string;
  service: { name: string; price?: number } | null;
  servicePrice?: number | null;
};

const COLORS = ["#22C55E", "#3B82F6", "#A855F7", "#EF4444"];

export default function MonthlyIncomeByServiceChart({
  data,
  selectedMonth = "all",
}: {
  data: Appointment[];
  selectedMonth?: string;
}) {
  const filtered = useMemo(() => {
    if (selectedMonth === "all") return data;
    const [y, m] = selectedMonth.split("-").map(Number);
    return data.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }, [data, selectedMonth]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      const price = a.servicePrice ?? a.service?.price ?? 0;
      map.set(name, (map.get(name) ?? 0) + price);
    });
    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [filtered]);

  const total = chartData.reduce((s, a) => s + a.total, 0);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-10">
        No hay datos para este mes
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Total del período:{" "}
        <span className="font-semibold">$ {total}</span>
      </p>

      <div className="w-full h-[260px] overflow-x-auto">
        <div className="min-w-[420px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => `$ ${v}`}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
