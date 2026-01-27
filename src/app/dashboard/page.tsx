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

const COLORS = ["#EF4444", "#22C55E", "#3B82F6"]; // 🔴 🟢 🔵

type Props = {
  data: Appointment[];
};

export default function MonthlyIncomeByServiceChart({ data }: Props) {
  const chartData = useMemo(() => {
    const map = new Map<string, number>();

    data.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      const price = a.servicePrice ?? a.service?.price ?? 0;
      map.set(name, (map.get(name) ?? 0) + price);
    });

    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [data]);

  return (
    <div className="w-full h-[300px]">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-10">
          No hay datos para este período
        </p>
      ) : (
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
      )}
    </div>
  );
}
