"use client";

import { useMemo } from "react";

type Appointment = {
  name?: string | null;
  lastName?: string | null;
};

export default function FrequentClientsCard({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const topClients = useMemo(() => {
    const map = new Map<string, number>();

    appointments.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [appointments]);

  if (topClients.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h3 className="text-sm font-semibold mb-3">
        ⭐ Clientes frecuentes
      </h3>

      <div className="space-y-2">
        {topClients.map(([name, count], i) => (
          <div
            key={name}
            className="flex justify-between text-sm"
          >
            <span className="font-medium">
              {i + 1}. {name}
            </span>
            <span className="text-gray-500">
              {count} turnos
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
