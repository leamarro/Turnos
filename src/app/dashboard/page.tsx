"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/StatCard";

/* =========================
   TYPES
========================= */
type Appointment = {
  id: string;
  date: string;
  name?: string | null;
  lastName?: string | null;
  service: {
    name: string;
    price?: number;
  } | null;
  servicePrice?: number | null;
};

/* =========================
   HELPERS
========================= */
const money = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
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
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();

  /* =========================
     MESES
  ========================= */
  const currentMonthKey = monthKey(now);
  const prevMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1));

  const currentMonth = appointments.filter(
    (a) => monthKey(new Date(a.date)) === currentMonthKey
  );

  const prevMonth = appointments.filter(
    (a) => monthKey(new Date(a.date)) === prevMonthKey
  );

  const incomeCurrent = currentMonth.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const incomePrev = prevMonth.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const monthVariation =
    incomePrev === 0 ? null : Math.round(((incomeCurrent - incomePrev) / incomePrev) * 100);

  /* =========================
     INSIGHT MES
  ========================= */
  const monthInsight = useMemo(() => {
    if (monthVariation === null)
      return "Todavía no hay datos para comparar este mes 📊";

    if (monthVariation > 10)
      return "Buen mes: los ingresos crecieron 📈";

    if (monthVariation < -10)
      return "Los ingresos bajaron respecto al mes anterior ⚠️";

    return "Ingresos estables respecto al mes anterior 😐";
  }, [monthVariation]);

  /* =========================
     SEMANAS (FIXED)
  ========================= */
  const thisWeekStart = startOfWeek(now);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(thisWeekStart.getDate() + 7);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisWeek = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= thisWeekStart && d < nextWeekStart;
  });

  const lastWeek = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= lastWeekStart && d < thisWeekStart;
  });

  const incomeThisWeek = thisWeek.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const incomeLastWeek = lastWeek.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const weekVariation =
    incomeLastWeek === 0
      ? null
      : Math.round(((incomeThisWeek - incomeLastWeek) / incomeLastWeek) * 100);

  /* =========================
     TOP CLIENTES (TABLA)
  ========================= */
  const topClients = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonth.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map[name] = (map[name] ?? 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [currentMonth]);

  /* =========================
     TENDENCIA 3 MESES
  ========================= */
  const last3Months = useMemo(() => {
    const map: Record<string, number> = {};

    appointments.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] =
        (map[key] ?? 0) + (a.servicePrice ?? a.service?.price ?? 0);
    });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-3)
      .map(([key, total], i, arr) => {
        const [y, m] = key.split("-");
        const name = new Date(Number(y), Number(m)).toLocaleDateString("es-AR", {
          month: "long",
        });

        const prev = arr[i - 1]?.[1] ?? null;
        const trend =
          prev === null ? null : total > prev ? "up" : total < prev ? "down" : "same";

        return { name, total, trend };
      });
  }, [appointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24 space-y-6">

        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* INSIGHT */}
        <div className="bg-black text-white rounded-2xl p-4 text-sm">
          {monthInsight}
        </div>

        {/* MES */}
        <StatCard title="Ingresos del mes" value={money(incomeCurrent)} />
        <StatCard title="Turnos del mes" value={currentMonth.length} />

        {/* SEMANA */}
        <div className="bg-white rounded-2xl p-4 shadow text-sm space-y-1">
          <p className="font-medium">Esta semana vs anterior</p>
          <p>Semana anterior: {money(incomeLastWeek)}</p>
          <p>Esta semana: {money(incomeThisWeek)}</p>
          {weekVariation !== null && (
            <p className="text-gray-500">
              Variación: {weekVariation > 0 ? "↑" : "↓"} {Math.abs(weekVariation)}%
            </p>
          )}
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white rounded-2xl p-4 shadow text-sm">
          <p className="font-medium mb-2">Clientes más frecuentes</p>
          {topClients.length === 0 ? (
            <p className="text-gray-500">Sin datos este mes</p>
          ) : (
            <table className="w-full">
              <tbody>
                {topClients.map(([name, count]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className="text-right text-gray-500">
                      {count} turnos
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TENDENCIA */}
        <div className="bg-white rounded-2xl p-4 shadow text-sm">
          <p className="font-medium mb-2">Tendencia últimos 3 meses</p>
          {last3Months.map((m) => (
            <div key={m.name} className="flex justify-between">
              <span className="capitalize">{m.name}</span>
              <span>
                {money(m.total)}{" "}
                {m.trend === "up" && "↑"}
                {m.trend === "down" && "↓"}
              </span>
            </div>
          ))}
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-400">
            Cargando métricas…
          </p>
        )}
      </main>
    </div>
  );
}
