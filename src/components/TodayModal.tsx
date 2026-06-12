"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string; price?: number };
  servicePrice?: number | null;
};

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
  const todayApps = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => isSameDay(new Date(a.date), now))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  if (!open) return null;

  const income = todayApps.reduce(
    (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md max-h-[85vh] bg-[#f5f3ef] dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto shadow-xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Turnos de hoy</h2>
            <p className="text-xs text-gray-400">
              {todayApps.length} {todayApps.length === 1 ? "turno" : "turnos"} · ${income.toLocaleString("es-AR")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full active:scale-95 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lista */}
        {todayApps.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No hay turnos para hoy</p>
        ) : (
          <div className="space-y-2">
            {todayApps.map((a) => {
              const date = new Date(a.date);
              const isPast = date < new Date();
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
      </div>
    </div>
  );
}
