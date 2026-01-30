"use client";

import BusinessHighlights from "@/components/BusinessHighlights";
import MonthlyGrowthBadge from "@/components/MonthlyGrowthBadge";

type Appointment = {
  date: string;
  servicePrice?: number | null;
  service?: { price?: number } | null;
};

export default function DashboardClient({
  appointments,
}: {
  appointments: Appointment[];
}) {
  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Métricas del negocio
        </p>
      </div>

      {/* CRECIMIENTO */}
      <MonthlyGrowthBadge appointments={appointments} />

      {/* HIGHLIGHTS */}
      <BusinessHighlights appointments={appointments} />
    </div>
  );
}
