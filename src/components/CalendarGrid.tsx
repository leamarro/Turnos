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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const today = startOfDay(new Date());

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end }).filter((d) => d >= today);
  };

  const days = view === "week" ? getWeekDays() : getMonthDays();

  const getAppointmentsByDay = (day: Date) =>
    appointments.filter(
      (a) =>
        format(new Date(a.date), "yyyy-MM-dd") ===
        format(day, "yyyy-MM-dd")
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <div className="space-y-5 mt-4">
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

          return (
            <div
              key={day.toISOString()}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <h3 className="font-medium mb-2">
                {format(day, "EEEE dd", { locale: es })}
              </h3>

              {items.length === 0 && (
                <p className="text-sm text-gray-400">Sin turnos</p>
              )}

              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="bg-gray-50 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <p className="text-sm font-medium">
                      {a.user.name} {a.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.service.name} ·{" "}
                      {format(new Date(a.date), "HH:mm")} hs
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ================= DESKTOP =================
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
              className="bg-white rounded-xl p-3 min-h-[120px] shadow-sm"
            >
              <p className="text-sm font-medium mb-2 text-gray-700">
                {format(day, "dd", { locale: es })}
              </p>

              <div className="space-y-1">
                {items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="bg-gray-50 rounded-lg px-2 py-1 text-xs cursor-pointer hover:bg-gray-100 transition"
                  >
                    <p className="font-medium truncate">
                      {a.user.name} {a.user.lastName}
                    </p>
                    <p className="text-gray-500 truncate">
                      {a.service.name} ·{" "}
                      {format(new Date(a.date), "HH:mm")}
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
