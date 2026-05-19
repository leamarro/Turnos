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
  service: { name: string };
};

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const SLOT_H = 56; // px por hora
const TIME_W = 32;  // ancho columna de horas
const DAY_W = 60;   // ancho columna por día

export default function WeekGridView({
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

  const apptsByDay = (day: Date) =>
    appointments.filter(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

  const topForDate = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    return (h - 9 + m / 60) * SLOT_H;
  };

  const totalH = HOURS.length * SLOT_H; // 9h * 56 = 504px

  return (
    <div className="mt-2 select-none">
      {/* Navegación semana */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <p className="text-sm font-medium capitalize">
          {format(weekStart, "d", { locale: es })} –{" "}
          {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
        >
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Scroll horizontal para que entren los 7 días */}
      <div className="overflow-x-auto scrollbar-hide rounded-2xl bg-white shadow-sm">
        <div style={{ minWidth: TIME_W + DAY_W * 7 }}>

          {/* Header días */}
          <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
            <div style={{ width: TIME_W }} className="shrink-0" />
            {days.map((day) => {
              const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
              return (
                <div
                  key={day.toISOString()}
                  style={{ width: DAY_W }}
                  className="shrink-0 text-center py-2"
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {format(day, "EEE", { locale: es })}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mt-0.5 ${
                      isToday ? "bg-black text-white" : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grilla scrolleable verticalmente */}
          <div className="overflow-y-auto" style={{ maxHeight: "62vh" }}>
            <div className="flex relative" style={{ height: totalH }}>

              {/* Columna de horas */}
              <div style={{ width: TIME_W }} className="shrink-0 relative">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute right-2 text-[10px] text-gray-400 tabular-nums"
                    style={{ top: (h - 9) * SLOT_H - 7 }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {days.map((day) => {
                const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                const dayAppts = apptsByDay(day);

                return (
                  <div
                    key={day.toISOString()}
                    style={{ width: DAY_W }}
                    className={`shrink-0 relative border-l border-gray-100 ${
                      isToday ? "bg-gray-50/60" : ""
                    }`}
                  >
                    {/* Líneas de hora */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: (h - 9) * SLOT_H }}
                      />
                    ))}

                    {/* Bloques de turno */}
                    {dayAppts.map((a) => {
                      const d = new Date(a.date);
                      const top = topForDate(d);
                      return (
                        <button
                          key={a.id}
                          onClick={() => onSelectAppointment?.(a.id)}
                          className="absolute left-0.5 right-0.5 bg-black text-white rounded-lg px-1.5 py-1 text-left overflow-hidden active:opacity-70 transition"
                          style={{ top: top + 2, height: 46 }}
                        >
                          <p className="text-[10px] font-semibold leading-tight truncate">
                            {a.name}
                          </p>
                          <p className="text-[9px] opacity-60 leading-tight truncate mt-0.5">
                            {format(d, "HH:mm")} · {a.service.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
