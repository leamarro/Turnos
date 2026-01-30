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
const isSameMonth = (d: Date, ref: Date) =>
  d.getFullYear() === ref.getFullYear() &&
  d.getMonth() === ref.getMonth();

const formatMoney = (n: number) =>
  `$ ${n.toLocaleString("es-AR")}`;

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
      } catch (e) {
        console.error(e);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* =========================
     FECHAS CLAVE
  ========================= */
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  /* =========================
     DATA POR MES
  ========================= */
  const currentMonthData = useMemo(
    () =>
      appointments.filter((a) =>
        isSameMonth(new Date(a.date), now)
      ),
    [appointments]
  );

  const prevMonthData = useMemo(
    () =>
      appointments.filter((a) =>
        isSameMonth(new Date(a.date), prevMonth)
      ),
    [appointments]
  );

  /* =========================
     MÉTRICAS
  ========================= */
  const incomeCurrent = useMemo(
    () =>
      currentMonthData.reduce(
        (sum, a) =>
          sum + (a.servicePrice ?? a.service?.price ?? 0),
        0
      ),
    [currentMonthData]
  );

  const incomePrev = useMemo(
    () =>
      prevMonthData.reduce(
        (sum, a) =>
          sum + (a.servicePrice ?? a.service?.price ?? 0),
        0
      ),
    [prevMonthData]
  );

  const variation =
    incomePrev === 0
      ? null
      : Math.round(((incomeCurrent - incomePrev) / incomePrev) * 100);

  const avgPerTurn =
    currentMonthData.length === 0
      ? 0
      : Math.round(incomeCurrent / currentMonthData.length);

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Resumen del mes</h1>
          <p className="text-sm text-gray-500 capitalize">
            {now.toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Ingresos del mes"
            value={formatMoney(incomeCurrent)}
            subtitle={
              variation === null
                ? "Sin datos del mes anterior"
                : `${variation > 0 ? "↑" : "↓"} ${Math.abs(
                    variation
                  )}% vs mes anterior`
            }
          />

          <StatCard
            title="Turnos del mes"
            value={currentMonthData.length.toString()}
            subtitle="Confirmados y pendientes"
          />

          <StatCard
            title="Ingreso promedio"
            value={formatMoney(avgPerTurn)}
            subtitle="Por turno"
          />

          <StatCard
            title="Mes anterior"
            value={formatMoney(incomePrev)}
            subtitle="Referencia"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-sm text-gray-500 text-center pt-6">
            Cargando métricas…
          </p>
        )}
      </main>
    </div>
  );
}
