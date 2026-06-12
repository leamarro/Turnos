"use client";

import { useState, useMemo } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string };
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

function minutesToSlot(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  const isToday = isSameDay(day, today);

  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const apptMap = new Map<string, Appointment>();
  for (const a of appointments) {
    const d = new Date(a.date);
    if (format(d, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")) {
      const slot = format(d, "HH:mm");
      apptMap.set(slot, a);
    }
  }

  const firstSlot = ALL_SLOTS.find((s) => apptMap.has(s)) || "09:00";
  const lastSlot = [...ALL_SLOTS].reverse().find((s) => apptMap.has(s)) || "21:00";

  const visibleSlots = isToday
    ? ALL_SLOTS.filter((s) => slotToMinutes(s) >= Math.min(nowMinutes - 60, slotToMinutes(firstSlot)))
    : ALL_SLOTS;

  const currentSlotIndex = ALL_SLOTS.findIndex((s) => {
    const next = ALL_SLOTS[ALL_SLOTS.indexOf(s) + 1];
    if (!next) return false;
    return slotToMinutes(s) <= nowMinutes && slotToMinutes(next) > nowMinutes;
  });

  return (
    <div className="mt-2">
      {/* Navegación día */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setDay((d) => addDays(d, -1))}
          className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>

        <div className="text-center">
          <p className="text-base font-semibold capitalize">
            {format(day, "EEEE d", { locale: es })}
            {isToday && <span className="text-black bg-gray-100 dark:bg-gray-800 text-[10px] ml-2 px-2 py-0.5 rounded-full font-medium">Hoy</span>}
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
            className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-500 active:bg-gray-100 transition"
          >
            Volver a hoy
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-[#252525] rounded-2xl overflow-hidden shadow-sm dark:border dark:border-gray-800 relative">
        {visibleSlots.map((slot, i) => {
          const appt = apptMap.get(slot);
          const isHour = slot.endsWith(":00");
          const isLunch = slotToMinutes(slot) >= slotToMinutes("12:30") && slotToMinutes(slot) < slotToMinutes("15:00");
          const slotMinutes = slotToMinutes(slot);
          const isPast = isToday && slotMinutes < nowMinutes;
          const isCurrentSlot = isToday && currentSlotIndex >= 0 && slot === ALL_SLOTS[currentSlotIndex];

          return (
            <div
              key={slot}
              className={`flex items-stretch min-h-[48px] ${
                i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""
              } ${isLunch && !appt ? "bg-gray-50/60 dark:bg-black/10" : ""} ${
                isCurrentSlot && !appt ? "bg-amber-50/50 dark:bg-amber-900/5" : ""
              }`}
            >
              {/* Indicador de hora actual */}
              {isCurrentSlot && (
                <div className="absolute left-14 right-0 pointer-events-none">
                  <div className="h-0.5 bg-red-500 relative">
                    <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                </div>
              )}

              {/* Hora */}
              <div className="w-14 shrink-0 flex items-center justify-end pr-3 relative">
                {isCurrentSlot && (
                  <div className="absolute right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
                <span className={`text-xs tabular-nums ${isHour ? "text-gray-500 dark:text-gray-400 font-medium" : "text-gray-300 dark:text-gray-600"}`}>
                  {isHour ? slot : "·"}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 py-1 pr-3 flex items-center">
                {appt ? (
                  <button
                    onClick={() => onSelectAppointment?.(appt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 transition active:opacity-80 relative overflow-hidden ${
                      isPast
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        : "bg-black text-white"
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: appt.service.color || "#000" }}
                    />
                    <div className="pl-2">
                      <p className="text-sm font-medium leading-tight">
                        {appt.name} {appt.lastName}
                      </p>
                      <p className={`text-xs mt-0.5 ${isPast ? "text-gray-400" : "text-gray-400"}`}>
                        {appt.service.name}
                      </p>
                    </div>
                  </button>
                ) : isLunch ? (
                  <span className="text-xs text-gray-300 dark:text-gray-600 italic pl-1">pausa</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
