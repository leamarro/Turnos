"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string };
};

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30","21:00",
];

export default function AvailabilityView({
  appointments,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  onSelectAppointment?: (id: string) => void;
}) {
  const [day, setDay] = useState(startOfDay(new Date()));
  const today = startOfDay(new Date());
  const isToday = day.getTime() === today.getTime();

  const apptMap = new Map<string, Appointment>();
  for (const a of appointments) {
    const d = new Date(a.date);
    if (format(d, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")) {
      apptMap.set(format(d, "HH:mm"), a);
    }
  }

  const freeCount = TIME_SLOTS.filter((s) => !apptMap.has(s)).length;

  return (
    <div className="mt-2">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDay((d) => addDays(d, -1))}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>

        <div className="text-center">
          <p className="text-base font-semibold capitalize">
            {format(day, "EEEE d", { locale: es })}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {format(day, "MMMM yyyy", { locale: es })}
          </p>
        </div>

        <button
          onClick={() => setDay((d) => addDays(d, 1))}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      </div>

      {!isToday && (
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setDay(today)}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-500"
          >
            Volver a hoy
          </button>
        </div>
      )}

      {/* Resumen */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{freeCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">libres</p>
        </div>
        <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{apptMap.size}</p>
          <p className="text-xs text-gray-400 mt-0.5">ocupados</p>
        </div>
        <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{TIME_SLOTS.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">en total</p>
        </div>
      </div>

      {/* Grid de horarios */}
      <div className="space-y-1.5">
        {TIME_SLOTS.map((slot) => {
          const appt = apptMap.get(slot);

          return appt ? (
            <button
              key={slot}
              onClick={() => onSelectAppointment?.(appt.id)}
              className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3 text-left active:opacity-70 transition"
            >
              <span className="text-sm font-semibold tabular-nums text-gray-400 w-12 shrink-0">
                {slot}
              </span>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {appt.name} {appt.lastName}
                </p>
                <p className="text-xs text-gray-400">{appt.service.name}</p>
              </div>
            </button>
          ) : (
            <div
              key={slot}
              className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100"
            >
              <span className="text-sm font-semibold tabular-nums text-gray-800 w-12 shrink-0">
                {slot}
              </span>
              <span className="text-sm text-emerald-500 font-medium">Libre</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
