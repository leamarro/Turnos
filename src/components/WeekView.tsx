"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney as money } from "@/lib/format";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string; price?: number };
  servicePrice?: number | null;
  payments?: { amount: number; createdAt?: string | Date }[];
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
          className="p-2 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 rounded-full transition"
        >
          <ChevronLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <p className="text-sm font-medium capitalize">
          {format(weekStart, "d", { locale: es })} –{" "}
          {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="p-2 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 rounded-full transition"
        >
          <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" />
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
            className={`bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:shadow-none dark:border dark:border-gray-800 ${isPast ? "opacity-50" : ""}`}
          >
            <h3 className="flex items-center gap-2 font-medium mb-3 capitalize">
              <span className="text-gray-600 dark:text-gray-300">{format(day, "EEEE", { locale: es })}</span>
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-brand text-brand-contrast" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {format(day, "d")}
              </span>
            </h3>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sin turnos</p>
            ) : (
              <div className="space-y-2">
                {items.map((a) => {
                  const total = a.servicePrice ?? a.service?.price ?? 0;
                  const paid = a.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
                  const remaining = total - paid;
                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelectAppointment?.(a.id)}
                      className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl px-3 py-3 cursor-pointer active:bg-gray-100 dark:active:bg-[#333] transition overflow-hidden relative"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: a.service.color || "#000000" }} />
                      <div className="flex justify-between items-center gap-2 pl-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {a.name} {a.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{a.service.name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {remaining > 0 && total > 0 && (
                            <span className="text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-full">
                              falta {money(remaining)}
                            </span>
                          )}
                          <p className="text-sm font-bold tabular-nums text-gray-700 dark:text-gray-200">
                            {format(new Date(a.date), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
