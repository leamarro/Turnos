"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, isSameDay, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  user: { name: string; lastName: string };
  service: { name: string };
};

const DAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarGrid({
  appointments,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  view?: string; // mantenido por compatibilidad, siempre muestra mes
  onSelectAppointment?: (id: string) => void;
}) {
  const today = startOfDay(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Offset para que empiece en lunes (lunes=0, domingo=6)
  const startOffset = (monthStart.getDay() + 6) % 7;

  const apptsByDay = (day: Date) =>
    appointments
      .filter((a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedAppts = apptsByDay(selectedDay);

  return (
    <div>
      {/* Navegación mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate((d) => addMonths(d, -1))}
          className="p-2 rounded-full active:bg-gray-100 transition"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>

        <h2 className="text-base font-semibold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>

        <button
          onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          className="p-2 rounded-full active:bg-gray-100 transition"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7">
        {/* Celdas vacías hasta el primer día */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Días del mes */}
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
              <span
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition
                  ${isToday ? "bg-black text-white" : ""}
                  ${isSelected && !isToday ? "bg-gray-100 ring-1 ring-gray-300" : ""}
                  ${!isToday && !isSelected ? (isPast ? "text-gray-400" : "text-gray-800") : ""}
                `}
              >
                {format(day, "d")}
              </span>

              {/* Puntos de turnos */}
              <div className="flex gap-0.5 mt-0.5 h-1.5 items-center">
                {appts.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${isPast ? "bg-gray-300" : "bg-black"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Turnos del día seleccionado */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 mb-2 capitalize">
          {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
        </p>

        {selectedAppts.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin turnos</p>
        ) : (
          <div className="space-y-2">
            {selectedAppts.map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectAppointment?.(a.id)}
                className="bg-white rounded-xl px-4 py-3 flex justify-between items-center shadow-sm cursor-pointer active:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-medium">
                    {a.user.name} {a.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.service.name}</p>
                </div>
                <p className="text-sm font-bold tabular-nums text-gray-700">
                  {format(new Date(a.date), "HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón volver a hoy */}
      {!isSameDay(currentDate, today) && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => { setCurrentDate(today); setSelectedDay(today); }}
            className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-500"
          >
            Volver a hoy
          </button>
        </div>
      )}
    </div>
  );
}
