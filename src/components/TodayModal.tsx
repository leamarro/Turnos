"use client";

import { useState, useMemo, useRef } from "react";
import { format, isSameDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string; price?: number };
  servicePrice?: number | null;
};

function dayLabel(date: Date) {
  const today = new Date();
  if (isSameDay(date, today)) return "hoy";
  if (isSameDay(date, addDays(today, 1))) return "mañana";
  if (isSameDay(date, addDays(today, -1))) return "ayer";
  return format(date, "EEEE", { locale: es });
}

export default function TodayModal({
  appointments,
  open,
  onClose,
  onSelect,
}: {
  appointments: Appointment[];
  open: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState(today);

  const touchStartX = useRef(0);

  const dayApps = useMemo(() => {
    return appointments
      .filter((a) => isSameDay(new Date(a.date), selectedDay))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, selectedDay]);

  const canGoPrev = selectedDay > today;

  function goTo(direction: "prev" | "next") {
    if (direction === "prev" && !canGoPrev) return;
    setSelectedDay((d) => addDays(d, direction === "next" ? 1 : -1));
    haptic();
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dist = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dist) > 40) {
      const direction = dist < 0 ? "next" : "prev";
      if (direction === "prev" && !canGoPrev) return;
      goTo(direction);
    }
  }

  if (!open) return null;

  const now = new Date();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md max-h-[80vh] bg-[#f5f3ef] dark:bg-[#1a1a1a] rounded-3xl p-5 overflow-y-auto shadow-xl animate-fade-up"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => goTo("prev")}
            disabled={!canGoPrev}
            className={`p-2 rounded-full active:scale-95 transition ${canGoPrev ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "opacity-20"}`}
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold capitalize">
              Turnos de {dayLabel(selectedDay)}
            </h2>
            <p className="text-xs text-gray-400 capitalize">
              {format(selectedDay, "d MMMM yyyy", { locale: es })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {dayApps.length} {dayApps.length === 1 ? "turno" : "turnos"}
            </p>
          </div>

          <button
            onClick={() => goTo("next")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full active:scale-95 transition"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Lista */}
        {dayApps.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Sin turnos este día</p>
        ) : (
          <div className="space-y-2">
            {dayApps.map((a) => {
              const date = new Date(a.date);
              const isPast = isSameDay(selectedDay, today) && date < now;
              return (
                <button
                  key={a.id}
                  onClick={() => { onSelect?.(a.id); onClose(); }}
                  className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] ${
                    isPast
                      ? "bg-white/60 dark:bg-white/5 opacity-60"
                      : "bg-white dark:bg-[#252525] shadow-sm"
                  }`}
                >
                  <div className="flex flex-col items-center w-12 shrink-0">
                    <span className="text-lg font-bold tabular-nums">
                      {format(date, "HH:mm")}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {isPast ? "pasó" : ""}
                    </span>
                  </div>
                  <div
                    className="w-1 rounded-full shrink-0 self-stretch"
                    style={{ backgroundColor: a.service.color || "#000" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {a.name} {a.lastName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.service.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 text-sm text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
