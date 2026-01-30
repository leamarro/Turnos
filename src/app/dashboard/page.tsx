"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import MonthlyTrendSparkline from "@/components/MonthlyTrendSparkline";

/* =========================
   TYPES
========================= */
type Appointment = {
  id: string;
  date: string;
  name?: string | null;
  lastName?: string | null;
  service?: {
    price?: number;
  } | null;
  servicePrice?: number | null;
};

/* =========================
   HELPERS
========================= */
const formatMoney = (v: number) =>
  v.toLocaleString("es-AR", { minimumFractionDigits: 0 });

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  /* =========================
     DERIVED DATA
  ========================= */
  const now = new Date();

  const incomeByMonth = useMemo(() => {
    const map = new Map<string, number>();

    appointments.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const price = a.servicePrice ?? a.service?.price ?? 0;
      map.set(key, (map.get(key) ?? 0) + price);
    });

    return map;
  }, [appointments]);

  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  const prevKey = `${now.getFullYear()}-${now.getMonth() - 1}`;

  const incomeCurrent = incomeByMonth.get(currentKey) ?? 0;
  const incomePrev = incomeByMonth.get(prevKey) ?? 0;

  const variation =
    incomePrev > 0
      ? Math.round(((incomeCurrent - incomePrev) / incomePrev) * 100)
      : null;

  const trendEmoji =
    variation === null ? "➖" : variation > 0 ? "📈" : variation < 0 ? "📉" : "➖";

  /* =========================
     WEEK SUMMARY
  ========================= */
  const weekStart = startOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const weekIncome = (start: Date) =>
    appointments.reduce((sum, a) => {
      const d = new Date(a.date);
      if (d >= start && d < new Date(start.getTime() + 7 * 86400000)) {
        return sum + (a.servicePrice ?? a.service?.price ?? 0);
      }
      return sum;
    }, 0);

  const incomeThisWeek = weekIncome(weekStart);
  const incomeLastWeek = weekIncome(prevWeekStart);

  /* =========================
     TOP CLIENT
  ========================= */
  const topClient = useMemo(() => {
    const map = new Map<string, number>();

    appointments.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [appointments]);

  if (loading) {
    return <p className="p-6 text-sm">Cargando dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-xl mx-auto px-4 pt-16 pb-24 space-y-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* INGRESOS MES */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-2">
          <p className="text-sm text-gray-500">Ingresos del mes</p>

          <div className="flex items-end justify-between">
            <p className="text-2xl font-semibold">
              $ {formatMoney(incomeCurrent)}
            </p>

            <span className="text-xl">{trendEmoji}</span>
          </div>

          {variation !== null && (
            <p className="text-xs text-gray-500">
              {variation > 0 ? "↑" : "↓"} {Math.abs(variation)}% vs mes anterior
            </p>
          )}

          <MonthlyTrendSparkline data={appointments} />

          <p className="text-xs text-gray-400">
            Tendencia últimos 3 meses
          </p>
        </div>

        {/* SEMANA */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-1">
          <p className="text-sm text-gray-500">Resumen semanal</p>

          <p className="text-lg font-semibold">
            $ {formatMoney(incomeThisWeek)}
          </p>

          <p className="text-xs text-gray-500">
            Semana anterior: $ {formatMoney(incomeLastWeek)}
          </p>
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-3">
            Clientes más frecuentes
          </p>

          <div className="space-y-2">
            {topClient.map(([name, count], i) => (
              <div
                key={name}
                className="flex justify-between text-sm"
              >
                <span className="font-medium">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {name}
                </span>
                <span className="text-gray-500">
                  {count} turnos
                </span>
              </div>
            ))}

            {topClient.length === 0 && (
              <p className="text-sm text-gray-400">
                Aún sin datos suficientes
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
