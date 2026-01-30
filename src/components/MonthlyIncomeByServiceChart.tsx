"use client";

import { useMemo, useEffect, useState } from "react";
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

const COLORS = ["#111827", "#4B5563", "#9CA3AF", "#6B7280"];

export default function MonthlyIncomeByServiceChart({
  data,
  selectedMonth = "all",
}: {
  data: Appointment[];
  selectedMonth?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
          />

          {/* 🔥 ocultamos Y en mobile */}
          {!isMobile && <YAxis />}

          {/* tooltip solo aparece al tocar */}
          <Tooltip
            formatter={(value) => {
              if (typeof value !== "number") return value;
              return `$ ${value}`;
            }}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />

          <Bar dataKey="total" radius={[8, 8, 0, 0]} animationDuration={300}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
