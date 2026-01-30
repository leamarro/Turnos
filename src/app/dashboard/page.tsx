"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

/* =========================
   TYPES
========================= */
type Appointment = {
  id: string;
  date: string;
  service?: {
    name?: string;
    price?: number;
  } | null;
  servicePrice?: number | null;
  name?: string | null;
  lastName?: string | null;
};

/* =========================
   HELPERS
========================= */
const formatMoney = (v: number) =>
  `$ ${v.toLocaleString("es-AR")}`;

function getIncomeByMonth(
  appointments: Appointment[],
  year: number,
  month: number
) {
  return appointments
    .filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce(
      (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
      0
    );
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

/* =========================
   SPARKLINE (MINI)
========================= */
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-1 h-10 mt-2">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 rounded bg-black/70 transition-all"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/appointments", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  /* ================= INGRESOS MES ================= */
  const incomeCurrent = useMemo(
    () =>
      getIncomeByMonth(
        appointments,
        now.getFullYear(),
        now.getMonth()
      ),
    [appointments]
  );

  const incomePrev = useMemo(() => {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return getIncomeByMonth(
      appointments,
      prev.getFullYear(),
      prev.getMonth()
    );
  }, [appointments]);

  const monthlyVariation =
    incomePrev > 0
      ? ((incomeCurrent - incomePrev) / incomePrev) * 100
      : null;

  /* ================= SEMANA ================= */
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeekIncome = useMemo(
    () =>
      appointments
        .filter((a) => new Date(a.date) >= thisWeekStart)
        .reduce(
          (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
          0
        ),
    [appointments]
  );

  const lastWeekIncome = useMemo(
    () =>
      appointments
        .filter((a) => {
          const d = new Date(a.date);
          return d >= lastWeekStart && d < thisWeekStart;
        })
        .reduce(
          (s, a) => s + (a.servicePrice ?? a.service?.price ?? 0),
          0
        ),
    [appointments]
  );

  /* ================= CLIENTE TOP ================= */
  const topClient = useMemo(() => {
    const map = new Map<string, number>();

    appointments.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });

    return [...map.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [appointments]);

  /* ================= TENDENCIA 3 MESES ================= */
  const trendValues = useMemo(() => {
    return [2, 1, 0].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return getIncomeByMonth(
        appointments,
        d.getFullYear(),
        d.getMonth()
      );
    });
  }, [appointments]);

  if (loading) {
    return <p className="p-6 text-sm">Cargando dashboard…</p>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-6">

      {/* INGRESOS MES */}
      <div className="bg-white rounded-2xl p-4 shadow transition-all active:scale-[0.98]">
        <p className="text-sm text-gray-500">Ingresos del mes</p>
        <p className="text-2xl font-semibold mt-1">
          {formatMoney(incomeCurrent)}
        </p>
        <p
          className={`text-xs mt-2 ${
            monthlyVariation === null
              ? "text-gray-400"
              : monthlyVariation >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {monthlyVariation === null
            ? "Sin datos del mes anterior"
            : `${monthlyVariation > 0 ? "↑" : "↓"} ${Math.abs(
                monthlyVariation
              ).toFixed(1)}% vs mes anterior`}
        </p>

        <Sparkline values={trendValues} />
        <p className="text-xs text-gray-400 mt-1">
          Tendencia últimos 3 meses
        </p>
      </div>

      {/* SEMANA */}
      <div className="bg-white rounded-2xl p-4 shadow transition-all active:scale-[0.98]">
        <p className="text-sm text-gray-500">Ingresos esta semana</p>
        <p className="text-xl font-semibold mt-1">
          {formatMoney(thisWeekIncome)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Semana anterior: {formatMoney(lastWeekIncome)}
        </p>
      </div>

      {/* CLIENTE FRECUENTE */}
      {topClient && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-2">
            Cliente más frecuente
          </p>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{topClient[0]}</span>
            <span className="text-gray-500">
              {topClient[1]} turnos
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
