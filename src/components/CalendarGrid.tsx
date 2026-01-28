"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

type Appointment = {
  id: string;
  date: string;
  user: {
    name: string;
    lastName: string;
  };
  service: { name: string };
};

export default function CalendarGrid({
  appointments,
  view,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  view: "week" | "month";
  onSelectAppointment?: (id: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 640);

    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const today = startOfDay(new Date());

  /* ================= FECHAS ================= */

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const allDays = eachDayOfInterval({ start, end });

    // 🔑 MOBILE: arrancar desde hoy
    if (isMobile) {
      return allDays.filter((d) => d >= today);
    }

    return allDays;
  };

  const days = view === "week" ? getWeekDays() : getMonthDays();

  /* ================= TURNOS ================= */

  const getAppointmentsByDay = (day: Date) =>
    appointments
      .filter(
        (a) =>
          format(new Date(a.date), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

  const next = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, 7) : addDays(d, 30)
    );

  const prev = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, -7) : addDays(d, -30)
    );

  if (!isClient) return null;

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <div className="space-y-5 mt-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="text-gray-500 text-lg">←</button>

          <h2 className="font-semibold capitalize">
            {format(
              currentDate,
              view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
              { locale: es }
            )}
          </h2>

          <button onClick={next} className="text-gray-500 text-lg">→</button>
        </div>

        {/* DAYS */}
        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday =
            format(day, "yyyy-MM-dd") ===
            format(today, "yyyy-MM-dd");

          return (
            <div
              key={day.toISOString()}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              {/* DAY HEADER */}
              <h3 className="flex items-center gap-2 font-medium mb-3 capitalize">
                <span>{format(day, "EEEE", { locale: es })}</span>

                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                    isToday
                      ? "bg-black text-white"
                      : "text-gray-700"
                  }`}
                >
                  {format(day, "dd")}
                </span>
              </h3>

              {items.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No hay turnos
                </p>
              )}

              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-3 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {a.user.name} {a.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.service.name}
                      </p>
                    </div>

                    <span className="text-sm font-bold tabular-nums">
                      {format(new Date(a.date), "HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="text-gray-500 text-lg">←</button>

        <h2 className="text-lg font-semibold capitalize">
          {format(
            currentDate,
            view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
            { locale: es }
          )}
        </h2>

        <button onClick={next} className="text-gray-500 text-lg">→</button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday =
            format(day, "yyyy-MM-dd") ===
            format(today, "yyyy-MM-dd");

          return (
            <div
              key={day.toISOString()}
              className="bg-white rounded-xl p-3 min-h-[140px] shadow-sm"
            >
              <p
                className={`text-sm font-medium mb-2 flex items-center justify-center w-6 h-6 rounded-full ${
                  isToday
                    ? "bg-black text-white"
                    : "text-gray-700"
                }`}
              >
                {format(day, "dd")}
              </p>

              {items.length === 0 && (
                <p className="text-xs text-gray-400">—</p>
              )}

              <div className="space-y-1">
                {items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="bg-gray-50 rounded-lg px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium truncate">
                        {a.user.name} {a.user.lastName}
                      </p>
                      <span className="font-semibold tabular-nums">
                        {format(new Date(a.date), "HH:mm")}
                      </span>
                    </div>

                    <p className="text-gray-500 truncate">
                      {a.service.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
