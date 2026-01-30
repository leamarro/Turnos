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
  service: {
    price?: number;
  } | null;
  servicePrice?: number | null;
};

/* =========================
   HELPERS
========================= */
const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR")}`;

const getYearMonth = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

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
  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  const prevKey = `${now.getFullYear()}-${now.getMonth() - 1}`;

  /* =========================
     FILTROS POR MES (FIX)
  ========================= */
  const currentMonth = useMemo(
    () => appointments.filter((a) => getYearMonth(a.date) === currentKey),
    [appointments, currentKey]
  );

  const prevMonth = useMemo(
    () => appointments.filter((a) => getYearMonth(a.date) === prevKey),
    [appointments, prevKey]
  );

  /* =========================
     SEMANA ACTUAL
  ========================= */
  const weekStart = startOfWeek(new Date());
  const weekData = appointments.filter(
    (a) => new Date(a.date) >= weekStart
  );

  /* =========================
     MÉTRICAS
  ========================= */
  const incomeCurrent = currentMonth.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const incomePrev = prevMonth.reduce(
    (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const avgTicket =
    currentMonth.length === 0
      ? 0
      : Math.round(incomeCurrent / currentMonth.length);

  const variation =
    incomePrev === 0
      ? null
      : Math.round(((incomeCurrent - incomePrev) / incomePrev) * 100);

  /* =========================
     INSIGHT SIMPLE
  ========================= */
  const insight = useMemo(() => {
    if (variation === null)
      return "Aún no hay datos suficientes para comparar 📊";

    if (variation > 10)
      return "Los ingresos crecieron respecto al mes anterior 📈";

    if (variation < -10)
      return "Los ingresos bajaron respecto al mes anterior ⚠️";

    return "Los ingresos se mantienen estables 😐";
  }, [variation]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 capitalize">
            {now.toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* INSIGHT */}
        <div className="bg-black text-white rounded-2xl p-4">
          <p className="text-sm">{insight}</p>
        </div>

        {/* COMPARACIÓN MES */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium mb-3">
            Comparación mensual
          </p>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Mes anterior</p>
              <p className="font-semibold">{money(incomePrev)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Este mes</p>
              <p className="font-semibold">{money(incomeCurrent)}</p>
            </div>
          </div>

          {variation !== null && (
            <p className="text-xs text-gray-500 mt-2">
              Variación: {variation > 0 ? "↑" : "↓"} {Math.abs(variation)}%
            </p>
          )}
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Ingresos del mes" value={money(incomeCurrent)} />
          <StatCard title="Turnos del mes" value={currentMonth.length} />
          <StatCard title="Ticket promedio" value={money(avgTicket)} />
          <StatCard title="Semana actual" value={`${weekData.length} turnos`} />
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
