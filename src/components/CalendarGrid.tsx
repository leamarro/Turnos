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
  user: { name: string };
  service: { name: string };
};

export default function CalendarGrid({
  appointments,
  view,
}: {
  appointments: Appointment[];
  view: "week" | "month";
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Necesario para evitar errores SSR vs client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    } catch (e) {
      console.error("Error generating month days", e);
      return [];
    }
  };

  const today = startOfDay(new Date());

  const safeMonthDays = Array.isArray(getMonthDays())
    ? getMonthDays()
    : [];

  const days =
    view === "week"
      ? getWeekDays()
      : safeMonthDays.filter((d) => d >= today);

  const getAppointmentsByDay = (day: Date) => {
    return appointments.filter(
      (a) =>
        format(new Date(a.date), "yyyy-MM-dd") ===
        format(day, "yyyy-MM-dd")
    );
  };

  const next = () => {
    setCurrentDate((prev) =>
      view === "week" ? addDays(prev, 7) : addDays(prev, 30)
    );
  };

  const prev = () => {
    setCurrentDate((prev) =>
      view === "week" ? addDays(prev, -7) : addDays(prev, -30)
    );
  };

  if (!isClient) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // ---------------- MOBILE ----------------
  if (isMobile) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={prev} className="text-xl">◀</button>
          <h2 className="font-semibold text-lg">
            {format(
              currentDate,
              view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
              { locale: es }
            )}
          </h2>
          <button onClick={next} className="text-xl">▶</button>
        </div>

        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          return (
            <div
              key={day.toString()}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold mb-1">
                {format(day, "EEEE dd", { locale: es })}
              </h3>

              {items.length === 0 && (
                <p className="text-gray-500 text-sm">Sin turnos</p>
              )}

              {items.map((a) => (
                <div
                  key={a.id}
                  className="bg-gray-100 p-2 rounded-lg mt-2 border"
                >
                  <p className="font-medium">{a.user.name}</p>
                  <p className="text-sm text-gray-600">{a.service.name}</p>
                  <p className="text-xs text-gray-700">
                    {format(new Date(a.date), "HH:mm")} hs
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------- DESKTOP ----------------
  return (
    <div>
      <div className="flex justify-between mb-4">
        <button onClick={prev} className="text-xl">◀</button>

        <h2 className="text-xl font-semibold">
          {format(
            currentDate,
            view === "week" ? "dd MMM yyyy" : "MMMM yyyy",
            { locale: es }
          )}
        </h2>

        <button onClick={next} className="text-xl">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          return (
            <div
              key={day.toString()}
              className="border rounded-lg p-2 bg-white min-h-[110px]"
            >
              <p className="text-sm font-semibold mb-1">
                {format(day, "dd", { locale: es })}
              </p>

              {items.map((a) => (
                <div
                  key={a.id}
                  className="bg-gray-100 p-1 rounded mb-1 text-xs border"
                >
                  <p className="font-medium">{a.user.name}</p>
                  <p>{a.service.name}</p>
                  <p>{format(new Date(a.date), "HH:mm")} hs</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
