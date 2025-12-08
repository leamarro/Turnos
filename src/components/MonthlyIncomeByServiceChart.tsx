"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function MonthlyIncomeByServiceChart({
  selectedMonth = "all",
}: {
  selectedMonth?: string;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === "all") return appointments;

    const [year, month] = selectedMonth.split("-").map(Number);

    return appointments.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [appointments, selectedMonth]);

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

  return (
    <div className="w-full h-[300px]">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-10">
          No hay datos para este mes
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
