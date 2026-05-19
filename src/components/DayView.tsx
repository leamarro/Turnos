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

const ALL_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00",
];

function slotToMinutes(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
}

export default function DayView({
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
      const slot = format(d, "HH:mm");
      apptMap.set(slot, a);
    }
  }

  return (
    <div className="mt-2">
      {/* Navegación día */}
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

      {/* Timeline */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {ALL_SLOTS.map((slot, i) => {
          const appt = apptMap.get(slot);
          const isHour = slot.endsWith(":00");
          const isLunch = slotToMinutes(slot) >= slotToMinutes("12:30") && slotToMinutes(slot) < slotToMinutes("15:00");

          return (
            <div
              key={slot}
              className={`flex items-stretch min-h-[44px] ${
                i > 0 ? "border-t" : ""
              } ${isHour ? "border-gray-200" : "border-gray-100"} ${
                isLunch && !appt ? "bg-gray-50/60" : ""
              }`}
            >
              {/* Hora */}
              <div className="w-14 shrink-0 flex items-center justify-end pr-3">
                <span className={`text-xs tabular-nums ${isHour ? "text-gray-500 font-medium" : "text-gray-300"}`}>
                  {isHour ? slot : "·"}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 py-1.5 pr-3 flex items-center">
                {appt ? (
                  <button
                    onClick={() => onSelectAppointment?.(appt.id)}
                    className="w-full text-left bg-black text-white rounded-xl px-3 py-2 transition active:opacity-80"
                  >
                    <p className="text-sm font-medium leading-tight">
                      {appt.name} {appt.lastName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {appt.service.name}
                    </p>
                  </button>
                ) : isLunch ? (
                  <span className="text-xs text-gray-300 italic pl-1">pausa</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
