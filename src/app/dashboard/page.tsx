"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

// CARDS
import TodaySummaryCard from "@/components/TodaySummaryCard";
import TodayNextAppointments from "@/components/TodayNextAppointments";
import WeeklySummaryCard from "@/components/WeeklySummaryCard";
import TopServiceWeekCard from "@/components/TopServiceWeekCard";
import WeekComparisonCard from "@/components/WeekComparisonCard";

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
        console.error("Dashboard error", e);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Cargando dashboard…
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-xl mx-auto px-4 pt-16 pb-28 space-y-5">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>

        {/* ================= HOY ================= */}
        <TodaySummaryCard appointments={appointments} />

        <TodayNextAppointments appointments={appointments} />

        {/* ================= SEMANA ================= */}
        <WeeklySummaryCard appointments={appointments} />

        <TopServiceWeekCard appointments={appointments} />

        <WeekComparisonCard appointments={appointments} />

      </main>
    </div>
  );
}
