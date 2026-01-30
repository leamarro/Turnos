"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import TodaySummaryCard from "@/components/TodaySummaryCard";
import WeeklySummaryCard from "@/components/WeeklySummaryCard";

type Appointment = {
  id: string;
  date: string;
  service: {
    name: string;
    price?: number;
  } | null;
  servicePrice?: number | null;
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Cargando dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-xl mx-auto px-4 pt-16 pb-24 space-y-5">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>

        {/* HOY */}
        <TodaySummaryCard appointments={appointments} />

        {/* SEMANA */}
        <WeeklySummaryCard appointments={appointments} />

      </main>
    </div>
  );
}
