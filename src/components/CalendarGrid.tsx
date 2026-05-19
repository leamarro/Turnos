"use client";

import { useState, useEffect } from "react";
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

  const today = startOfDay(new Date());

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
    return eachDayOfInterval({ start, end });
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  /* ================= NAV ================= */

  const next = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, 7) : addDays(d, 30)
    );

  const prev = () =>
    setCurrentDate((d) =>
      view === "week" ? addDays(d, -7) : addDays(d, -30)
    );

  const goToday = () => setCurrentDate(new Date());

  if (!isClient) return null;

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <div className="relative space-y-4 mt-2 pt-1 pb-4">
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
            format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

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
                <p className="text-sm text-gray-400 italic">No hay turnos</p>
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
                        <p className="text-xs text-gray-500">{a.service.name}</p>
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
          className="fixed bottom-24 right-4 sm:bottom-6 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition active:scale-95"
        >
          Hoy
        </button>
      </div>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <div className="relative space-y-4 mt-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="text-gray-500 hover:text-black text-lg px-2">←</button>

        <h2 className="font-semibold capitalize text-lg">
          {format(
            currentDate,
            view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
            { locale: es }
          )}
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Hoy
          </button>
          <button onClick={next} className="text-gray-500 hover:text-black text-lg px-2">→</button>
        </div>
      </div>

      {/* WEEK DAY HEADERS */}
      <div className="grid grid-cols-7 gap-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* DAYS GRID */}
      <div className="grid grid-cols-7 gap-2">
        {view === "month" && (
          <>
            {/* Empty cells for days before month start */}
            {Array.from({ length: startOfMonth(currentDate).getDay() === 0 ? 6 : startOfMonth(currentDate).getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-transparent" />
            ))}
          </>
        )}

        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday =
            format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isPast = day < today;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] rounded-xl p-2 border transition ${
                isToday
                  ? "bg-white border-black shadow-sm"
                  : isPast
                  ? "bg-gray-50 border-gray-100 opacity-60"
                  : "bg-white border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-black text-white" : "text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {items.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="text-[11px] bg-gray-100 rounded-md px-1.5 py-1 cursor-pointer hover:bg-gray-200 transition truncate"
                    title={`${a.user.name} ${a.user.lastName} - ${a.service.name}`}
                  >
                    <span className="font-medium">
                      {format(new Date(a.date), "HH:mm")}
                    </span>{" "}
                    <span className="text-gray-600">
                      {a.user.name}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-[11px] text-gray-400 pl-1">
                    +{items.length - 3} más
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
