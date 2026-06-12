"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string };
};

export default function WeekView({
  appointments,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  onSelectAppointment?: (id: string) => void;
}) {
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="mt-2 space-y-3">
      {/* Navegación semana */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <p className="text-sm font-medium capitalize">
          {format(weekStart, "d", { locale: es })} –{" "}
          {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Tarjetas por día */}
      {days.map((day) => {
        const items = appointments.filter(
          (a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );
        const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        const isPast = day < today && !isToday;

        return (
          <div
            key={day.toISOString()}
            className={`bg-white rounded-2xl p-4 shadow-sm ${isPast ? "opacity-50" : ""}`}
          >
            <h3 className="flex items-center gap-2 font-medium mb-3 capitalize">
              <span className="text-gray-600">{format(day, "EEEE", { locale: es })}</span>
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-black text-white" : "text-gray-700"
                }`}
              >
                {format(day, "d")}
              </span>
            </h3>

            {items.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin turnos</p>
            ) : (
              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment?.(a.id)}
                    className="bg-gray-50 rounded-xl px-3 py-3 cursor-pointer active:bg-gray-100 transition overflow-hidden relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: a.service.color || "#000000" }} />
                    <div className="flex justify-between items-center pl-2">
                      <div>
                        <p className="text-sm font-medium">
                          {a.name} {a.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{a.service.name}</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-gray-700">
                        {format(new Date(a.date), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
