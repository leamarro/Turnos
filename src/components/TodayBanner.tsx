"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color: string; price?: number };
  servicePrice?: number | null;
};

export default function TodayBanner({ appointments }: { appointments: Appointment[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayApps = appointments
      .filter((a) => isSameDay(new Date(a.date), now))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const count = todayApps.length;
    const income = todayApps.reduce(
      (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
      0
    );

    const next = todayApps.find((a) => new Date(a.date) >= now);

    return { count, income, next };
  }, [appointments]);

  if (data.count === 0) return null;

  return (
    <div className="bg-black text-white rounded-2xl p-4 mb-4 flex items-center justify-between overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10 space-y-0.5">
        <p className="text-xs text-white/60">Hoy</p>
        <p className="text-xl font-bold tracking-tight">
          {data.count} {data.count === 1 ? "turno" : "turnos"}
        </p>
        <p className="text-xs text-white/50">
          ${data.income.toLocaleString("es-AR")}
        </p>
      </div>
      {data.next && (
        <div className="relative z-10 text-right">
          <p className="text-lg font-bold tabular-nums leading-none">
            {format(new Date(data.next.date), "HH:mm")}
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            {data.next.name} {data.next.lastName}
          </p>
          <p className="text-[10px] text-white/40">
            {data.next.service.name}
          </p>
        </div>
      )}
    </div>
  );
}
