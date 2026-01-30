"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Appointment = {
  date: string;
  service: { name: string; price?: number } | null;
  servicePrice?: number | null;
};

const COLORS = ["#EF4444", "#22C55E", "#3B82F6", "#A855F7"];

export default function MonthlyIncomeByServiceChart({
  data,
  selectedMonth = "all",
}: {
  data: Appointment[];
  selectedMonth?: string;
}) {
  const filteredByMonth = useMemo(() => {
    if (selectedMonth === "all") return data;

    const [year, month] = selectedMonth.split("-").map(Number);

    return data.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [data, selectedMonth]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();

    filteredByMonth.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      const price = a.servicePrice ?? a.service?.price ?? 0;
      map.set(name, (map.get(name) ?? 0) + price);
    });

    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [filteredByMonth]);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-10">
        No hay datos para este mes
      </p>
    );
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
