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

const yearMonthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

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
     MES ACTUAL vs ANTERIOR
  ========================= */
  const currentMonthKey = yearMonthKey(now);
  const prevMonthKey = yearMonthKey(new Date(now.getFullYear(), now.getMonth() - 1));

  const currentMonth = appointments.filter(
    (a) => yearMonthKey(new Date(a.date)) === currentMonthKey
  );

  const prevMonth = appointments.filter(
    (a) => yearMonthKey(new Date(a.date)) === prevMonthKey
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
     SEMANA ACTUAL vs ANTERIOR
  ========================= */
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisWeek = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= thisWeekStart;
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
     CLIENTE + SERVICIO TOP
  ========================= */
  const topClient = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonth.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [currentMonth]);

  const topService = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonth.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [currentMonth]);

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
          <p className="text-sm">{monthInsight}</p>
        </div>

        {/* MES */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-2">
          <p className="text-sm font-medium">Mes actual vs anterior</p>

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

          {monthVariation !== null && (
            <p className="text-xs text-gray-500">
              Variación: {monthVariation > 0 ? "↑" : "↓"} {Math.abs(monthVariation)}%
            </p>
          )}
        </div>

        {/* SEMANA */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-2">
          <p className="text-sm font-medium">Esta semana vs anterior</p>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Semana anterior</p>
              <p className="font-semibold">{money(incomeLastWeek)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Esta semana</p>
              <p className="font-semibold">{money(incomeThisWeek)}</p>
            </div>
          </div>

          {weekVariation !== null && (
            <p className="text-xs text-gray-500">
              Variación: {weekVariation > 0 ? "↑" : "↓"} {Math.abs(weekVariation)}%
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Ingresos del mes" value={money(incomeCurrent)} />
          <StatCard title="Turnos del mes" value={currentMonth.length} />
          <StatCard title="Cliente más frecuente" value={topClient} />
          <StatCard title="Servicio más vendido" value={topService} />
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
