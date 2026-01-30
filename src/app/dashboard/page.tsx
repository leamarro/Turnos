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

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
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
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  /* =========================
     FILTROS
  ========================= */
  const isSameMonth = (d: Date, ref: Date) =>
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth();

  const currentMonth = appointments.filter((a) =>
    isSameMonth(new Date(a.date), now)
  );

  const prevMonthData = appointments.filter((a) =>
    isSameMonth(new Date(a.date), prevMonth)
  );

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

  const incomePrev = prevMonthData.reduce(
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
     INSIGHT PRINCIPAL
  ========================= */
  const insight = useMemo(() => {
    if (variation === null)
      return { text: "Aún no hay datos para comparar 📊", emoji: "📊" };

    if (variation > 10)
      return { text: "Estás creciendo respecto al mes anterior", emoji: "📈" };

    if (variation < -10)
      return { text: "Los ingresos bajaron este mes", emoji: "⚠️" };

    return { text: "El negocio se mantiene estable", emoji: "😐" };
  }, [variation]);

  /* =========================
     INSIGHT PREDICTIVO
  ========================= */
  const extraPerTurn = 1000;
  const potential =
    currentMonth.length * extraPerTurn;

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
          <p className="text-sm">
            {insight.emoji} {insight.text}
          </p>
        </div>

        {/* MINI GRÁFICO */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium mb-3">
            Comparación mensual
          </p>

          <div className="flex items-end gap-6 h-24">
            <div className="flex-1">
              <div
                className="bg-gray-300 rounded-lg w-full"
                style={{ height: `${incomePrev ? 100 : 10}%` }}
              />
              <p className="text-xs text-center mt-1">Mes anterior</p>
            </div>

            <div className="flex-1">
              <div
                className="bg-black rounded-lg w-full"
                style={{
                  height:
                    incomePrev === 0
                      ? "100%"
                      : `${Math.min(
                          100,
                          (incomeCurrent / incomePrev) * 100
                        )}%`,
                }}
              />
              <p className="text-xs text-center mt-1">Este mes</p>
            </div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Ingresos del mes"
            value={money(incomeCurrent)}
          />
          <StatCard
            title="Turnos del mes"
            value={currentMonth.length}
          />
          <StatCard
            title="Ticket promedio"
            value={money(avgTicket)}
          />
          <StatCard
            title="Semana actual"
            value={`${weekData.length} turnos`}
          />
        </div>

        {/* INSIGHT PREDICTIVO */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm">
            🧠 Si aumentás el ticket promedio en{" "}
            <b>{money(extraPerTurn)}</b>, podrías ganar{" "}
            <b>{money(potential)}</b> más este mes
          </p>
        </div>

        {/* RESUMEN SEMANAL */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium mb-2">
            Resumen semanal (lun–dom)
          </p>
          <p className="text-sm text-gray-600">
            Turnos: <b>{weekData.length}</b>
          </p>
          <p className="text-sm text-gray-600">
            Ingresos:{" "}
            <b>
              {money(
                weekData.reduce(
                  (s, a) =>
                    s + (a.servicePrice ?? a.service?.price ?? 0),
                  0
                )
              )}
            </b>
          </p>
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
