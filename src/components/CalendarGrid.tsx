"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
  isSameWeek,
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
  const [showPastDays, setShowPastDays] = useState(false);

  const today = startOfDay(new Date());
  const touchStartX = useRef<number | null>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 640);

    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ================= FECHAS ================= */

  const getWeekDays = () => {
    const isCurrentWeek = isSameWeek(currentDate, today, { weekStartsOn: 1 });

    if (isMobile && isCurrentWeek) {
      return Array.from({ length: 7 }, (_, i) => addDays(today, i));
    }

    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start, end });

    if (isMobile && !showPastDays) {
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

  /* ================= NAV ================= */

  const next = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, 7) : addDays(d, 30)
    );

  const prev = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, -7) : addDays(d, -30)
    );

  const goToday = () => {
    setCurrentDate(new Date());
    setShowPastDays(false);
  };

  /* ================= SWIPE ================= */

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 60) {
      diff > 0 ? next() : prev();
    }

    touchStartX.current = null;
  };

  if (!isClient) return null;

  /* ================= MOBILE ================= */

  if (isMobile) {
    return (
      <div
        className="relative space-y-4 mt-4 pb-20"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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

        {/* ACTIONS */}
        {view === "month" && (
          <div>
            <button
              onClick={() => setShowPastDays((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                showPastDays
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {showPastDays
                ? "Ocultar días anteriores"
                : "Ver días anteriores"}
            </button>
          </div>
        )}

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
              <h3 className="flex items-center gap-2 font-medium mb-3 capitalize">
                <span>{format(day, "EEEE", { locale: es })}</span>
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isToday ? "bg-black text-white" : "text-gray-700"
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
                    className="bg-gray-50 rounded-xl px-3 py-3 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {a.user.name} {a.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.service.name}
                        </p>
                      </div>

                      <p className="text-sm font-bold tabular-nums">
                        {format(new Date(a.date), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 🔘 BOTÓN HOY FIJO */}
        <button
          onClick={goToday}
          className="fixed bottom-6 right-4 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition active:scale-95"
        >
          Hoy
        </button>
      </div>
    );
  }

  /* ================= DESKTOP ================= */
  return null;
}
