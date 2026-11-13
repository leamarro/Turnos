"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, isSameDay, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  user: { name: string; lastName: string };
  service: { name: string; color?: string; id?: string };
};

const DAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarMonthGrid({
  appointments,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  onSelectAppointment?: (id: string) => void;
}) {
  const today = startOfDay(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const monthStart = startOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentDate) });
  const startOffset = (monthStart.getDay() + 6) % 7;

  const apptsByDay = (day: Date) =>
    appointments
      .filter((a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedAppts = apptsByDay(selectedDay);

  return (
    <div className="mt-2">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentDate((d) => addMonths(d, -1))} className="p-2 active:bg-gray-100 dark:active:bg-gray-800 rounded-full transition">
          <ChevronLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-base font-semibold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <button onClick={() => setCurrentDate((d) => addMonths(d, 1))} className="p-2 active:bg-gray-100 dark:active:bg-gray-800 rounded-full transition">
          <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Cabecera L M X J V S D */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grilla días */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

        {days.map((day) => {
          const appts = apptsByDay(day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const isPast = day < today && !isToday;

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center py-1 cursor-pointer"
            >
              <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition
                ${isToday ? "bg-brand text-brand-contrast" : ""}
                ${isSelected && !isToday ? "bg-gray-100 dark:bg-[#333] ring-1 ring-gray-300 dark:ring-gray-600" : ""}
                ${!isToday && !isSelected ? (isPast ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200") : ""}
              `}>
                {format(day, "d")}
              </span>
              {/* Barras de turnos */}
              <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-full">
                {appts.slice(0, 6).map((a, i) => (
                  <div
                    key={i}
                    className="w-3 h-2"
                    style={{ backgroundColor: a.service.color || "#000000" }}
                  />
                ))}
                {appts.length > 6 && (
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-none pt-[2px]">
                    +{appts.length - 6}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Turnos del día seleccionado */}
      <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 capitalize">
          {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
        </p>

        {selectedAppts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sin turnos</p>
        ) : (
          <div className="space-y-2">
            {selectedAppts.map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectAppointment?.(a.id)}
                className="bg-white dark:bg-[#252525] rounded-xl px-4 py-3 flex justify-between items-center shadow-sm dark:shadow-none dark:border dark:border-gray-800 cursor-pointer active:bg-gray-50 dark:active:bg-[#2f2f2f] transition overflow-hidden relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: a.service.color || "#000000" }} />
                <div className="pl-2">
                  <p className="text-sm font-medium">{a.user.name} {a.user.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.service.name}</p>
                </div>
                <p className="text-sm font-bold tabular-nums text-gray-700 dark:text-gray-200">
                  {format(new Date(a.date), "HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSameDay(currentDate, today) && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => { setCurrentDate(today); setSelectedDay(today); }}
            className="text-xs px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
          >
            Volver a hoy
          </button>
        </div>
      )}
    </div>
  );
}
