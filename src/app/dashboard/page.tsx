"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

// COMPONENTES
import TodayAlertCard from "@/components/TodayAlertCard";
import FrequentClientsCard from "@/components/FrequentClientsCard";
import WeeklyMiniChart from "@/components/WeeklyMiniChart";
import TurnsTable from "@/components/TurnsTable";

/* =========================
   TYPES
========================= */
type Appointment = {
  id: string;
  date: string;
  status: string;

  name?: string | null;
  lastName?: string | null;
  telefono?: string | null;

  service: {
    id: string;
    name: string;
    price?: number;
  } | null;

  servicePrice?: number | null;
};

/* =========================
   PAGE
========================= */
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/appointments", {
          cache: "no-store",
        });
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
     MÉTRICAS SIMPLES
  ========================= */
  const totalTurns = appointments.length;

  const totalIncome = useMemo(
    () =>
      appointments.reduce(
        (sum, a) =>
          sum + (a.servicePrice ?? a.service?.price ?? 0),
        0
      ),
    [appointments]
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* HEADER */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Resumen rápido de tu negocio
          </p>
        </header>

        {/* ALERTA HOY */}
        <TodayAlertCard appointments={appointments} />

        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow">
            <p className="text-xs text-gray-500">
              Turnos totales
            </p>
            <p className="text-2xl font-semibold">
              {totalTurns}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <p className="text-xs text-gray-500">
              Ingresos totales
            </p>
            <p className="text-2xl font-semibold">
              $ {totalIncome}
            </p>
          </div>
        </div>

        {/* RESUMEN SEMANAL */}
        <WeeklyMiniChart appointments={appointments} />

        {/* CLIENTES FRECUENTES */}
        <FrequentClientsCard appointments={appointments} />

        {/* TABLA (solo como respaldo, no protagonista) */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-sm font-semibold mb-3">
            📋 Últimos turnos
          </h3>

          <TurnsTable
            data={appointments.slice(0, 10)}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
