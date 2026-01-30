"use client";

import BusinessHighlights from "@/components/BusinessHighlights";
import MonthlyGrowthBadge from "@/components/MonthlyGrowthBadge";

type Appointment = {
  date: string;
  service?: { price?: number } | null;
  servicePrice?: number | null;
};

export default function DashboardPage({
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
          Resumen del negocio
        </p>
      </div>

      {/* CRECIMIENTO */}
      <MonthlyGrowthBadge appointments={appointments} />

      {/* HIGHLIGHTS */}
      <BusinessHighlights appointments={appointments} />
    </div>
  );
}
