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
  const todayRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const today = startOfDay(new Date());

  /* ================= DAYS ================= */
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = view === "week" ? getWeekDays() : getMonthDays();

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

  const goToToday = () => {
    setCurrentDate(new Date());
    setTimeout(() => {
      todayRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  if (!isClient) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  /* ================= AUTO SCROLL A HOY ================= */
  useEffect(() => {
    if (isMobile && view === "month" && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isMobile, view, currentDate]);

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

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="space-y-5 mt-4 transition-all duration-300"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="text-gray-500 text-lg">←</button>

          <h2 className="font-semibold">
            {format(
              currentDate,
              view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
              { locale: es }
            )}
          </h2>

          <button onClick={next} className="text-gray-500 text-lg">→</button>
        </div>

        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday =
            format(day, "yyyy-MM-dd") ===
            format(new Date(), "yyyy-MM-dd");

          return (
            <div
              ref={isToday ? todayRef : null}
              key={day.toISOString()}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-medium mb-2 capitalize">
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

        {/* FLOATING TODAY BUTTON */}
        <button
          onClick={goToToday}
          className="fixed bottom-6 right-4 bg-black text-white text-sm px-4 py-2 rounded-full shadow-lg active:scale-95 transition"
        >
          Hoy
        </button>
      </div>
    );
  }

  /* ================= DESKTOP (igual que antes) ================= */
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="text-gray-500 text-lg">←</button>

        <h2 className="text-lg font-semibold">
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

          return (
            <div
              key={day.toISOString()}
              className="bg-white rounded-xl p-3 min-h-[140px] shadow-sm"
            >
              <p className="text-sm font-medium mb-2 text-gray-700">
                {format(day, "dd", { locale: es })}
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
