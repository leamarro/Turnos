"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  format,
  getDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { es } from "date-fns/locale";

type Appointment = {
  date: string;
  service?: { price?: number } | null;
  servicePrice?: number | null;
};

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function BusinessHighlights({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const now = new Date();
  const monthInterval = {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };

  const monthAppointments = useMemo(
    () =>
      appointments.filter((a) =>
        isWithinInterval(new Date(a.date), monthInterval)
      ),
    [appointments]
  );

  /* ================= DIA MAS FUERTE ================= */

  const incomeByDay = useMemo(() => {
    const map = new Map<number, number>();

    monthAppointments.forEach((a) => {
      const day = getDay(new Date(a.date));
      const price = a.servicePrice ?? a.service?.price ?? 0;
      map.set(day, (map.get(day) ?? 0) + price);
    });

    return map;
  }, [monthAppointments]);

  const strongestDay = useMemo(() => {
    let max = 0;
    let dayIndex = 0;

    incomeByDay.forEach((total, day) => {
      if (total > max) {
        max = total;
        dayIndex = day;
      }
    });

    return { day: DAYS[dayIndex], total: max };
  }, [incomeByDay]);

  /* ================= HORARIO ESTRELLA ================= */

  const hourBuckets = useMemo(() => {
    const buckets = new Map<string, number>();

    monthAppointments.forEach((a) => {
      const h = new Date(a.date).getHours();
      const range =
        h < 12 ? "Mañana" : h < 16 ? "Mediodía" : h < 20 ? "Tarde" : "Noche";

      const price = a.servicePrice ?? a.service?.price ?? 0;
      buckets.set(range, (buckets.get(range) ?? 0) + price);
    });

    return buckets;
  }, [monthAppointments]);

  const topRange = useMemo(() => {
    let max = 0;
    let label = "";

    hourBuckets.forEach((total, range) => {
      if (total > max) {
        max = total;
        label = range;
      }
    });

    return { label, total: max };
  }, [hourBuckets]);

  /* ================= TICKET PROMEDIO ================= */

  const ticketAvg = useMemo(() => {
    if (monthAppointments.length === 0) return 0;

    const total = monthAppointments.reduce(
      (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
      0
    );

    return Math.round(total / monthAppointments.length);
  }, [monthAppointments]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* DIA MAS FUERTE */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">Día más fuerte del mes</p>
        <h3 className="text-xl font-semibold mt-1">
          {strongestDay.day || "—"}
        </h3>
        <p className="text-lg font-bold mt-1">
          ${strongestDay.total.toLocaleString("es-AR")}
        </p>
      </div>

      {/* DOS TARJETAS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Horario estrella</p>
          <p className="font-semibold mt-1">
            {topRange.label || "—"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Ticket promedio</p>
          <p className="font-semibold mt-1">
            ${ticketAvg.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
