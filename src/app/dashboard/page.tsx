"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

/* ======================
   TYPES
====================== */
type Appointment = {
  date: string;
  servicePrice?: number | null;
  service?: {
    price?: number;
  } | null;
  name?: string | null;
  lastName?: string | null;
};

/* ======================
   HELPERS
====================== */
const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

/* ======================
   PAGE
====================== */
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     FETCH
  ====================== */
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  /* ======================
     DATES
  ====================== */
  const now = new Date();

  const currentMonth = {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };

  const prevMonthDate = subMonths(now, 1);
  const prevMonth = {
    start: startOfMonth(prevMonthDate),
    end: endOfMonth(prevMonthDate),
  };

  const thisWeek = {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };

  const lastWeekDate = subWeeks(now, 1);
  const lastWeek = {
    start: startOfWeek(lastWeekDate, { weekStartsOn: 1 }),
    end: endOfWeek(lastWeekDate, { weekStartsOn: 1 }),
  };

  /* ======================
     METRICS
  ====================== */
  const income = (list: Appointment[]) =>
    list.reduce(
      (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
      0
    );

  const currentMonthData = appointments.filter((a) =>
    isWithinInterval(new Date(a.date), currentMonth)
  );

  const prevMonthData = appointments.filter((a) =>
    isWithinInterval(new Date(a.date), prevMonth)
  );

  const thisWeekData = appointments.filter((a) =>
    isWithinInterval(new Date(a.date), thisWeek)
  );

  const lastWeekData = appointments.filter((a) =>
    isWithinInterval(new Date(a.date), lastWeek)
  );

  const incomeCurrent = income(currentMonthData);
  const incomePrev = income(prevMonthData);

  const monthVariation =
    incomePrev === 0 ? null : ((incomeCurrent - incomePrev) / incomePrev) * 100;

  const weekVariation =
    lastWeekData.length === 0
      ? null
      : ((thisWeekData.length - lastWeekData.length) /
          lastWeekData.length) *
        100;

  /* ======================
     CLIENTES FRECUENTES
  ====================== */
  const topClients = useMemo(() => {
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

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-16 pb-20 space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-xs text-gray-500">Ingresos del mes</p>
          <p className="text-2xl font-semibold">{money(incomeCurrent)}</p>
          <p className="text-xs mt-1 text-gray-400">
            {monthVariation === null
              ? "Sin datos previos"
              : `${monthVariation > 0 ? "↑" : "↓"} ${Math.abs(
                  monthVariation
                ).toFixed(1)}% vs mes anterior`}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-xs text-gray-500">Turnos esta semana</p>
          <p className="text-2xl font-semibold">
            {thisWeekData.length}
          </p>
          <p className="text-xs mt-1 text-gray-400">
            {weekVariation === null
              ? "Sin semana previa"
              : `${weekVariation > 0 ? "↑" : "↓"} ${Math.abs(
                  weekVariation
                ).toFixed(0)}% vs semana anterior`}
          </p>
        </div>
      </div>

      {/* CLIENTES FRECUENTES */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <p className="text-sm font-medium mb-3">
          Clientes más frecuentes
        </p>

        {topClients.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos</p>
        ) : (
          <div className="space-y-2">
            {topClients.map(([name, count]) => (
              <div
                key={name}
                className="flex justify-between items-center text-sm"
              >
                <span>{name}</span>
                <span className="text-gray-500">
                  {count} turnos
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INSIGHT */}
      <div className="bg-black text-white rounded-2xl p-4">
        <p className="text-sm opacity-80">Insight</p>
        <p className="text-sm mt-1">
          Este mes llevás{" "}
          <strong>{currentMonthData.length}</strong> turnos y{" "}
          <strong>{money(incomeCurrent)}</strong> de ingresos.
        </p>
      </div>
    </div>
  );
}
