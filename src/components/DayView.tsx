"use client";

import { useState } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Payment = {
  amount: number;
  createdAt?: string | Date;
};

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color?: string; price?: number };
  servicePrice?: number | null;
  payments?: Payment[];
};

const money = (n: number) =>
  `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

function gapMinutes(a: Appointment, b: Appointment) {
  return (
    (new Date(b.date).getTime() - new Date(a.date).getTime()) / 60000
  );
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

  const dayAppts = appointments
    .filter((a) => isSameDay(new Date(a.date), day))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        {dayAppts.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            Sin turnos este día
          </p>
        ) : (
          dayAppts.map((appt, i) => {
            const date = new Date(appt.date);
            const total = appt.service?.price ?? appt.servicePrice ?? 0;
            const paid = appt.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
            const remaining = total - paid;

            return (
              <div key={appt.id}>
                <div
                  className={`flex items-stretch min-h-[48px] ${
                    i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""
                  }`}
                >
                  {/* Hora */}
                  <div className="w-14 shrink-0 flex items-center justify-end pr-3 relative">
                    <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 font-medium">
                      {format(date, "HH:mm")}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 py-1 pr-3 flex items-center">
                    <button
                      onClick={() => onSelectAppointment?.(appt.id)}
                      className="w-full text-left rounded-xl px-3 py-2.5 transition active:opacity-80 relative overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-[#252525] dark:border-gray-700"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ backgroundColor: appt.service.color || "#000" }}
                      />
                      <div className="pl-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {appt.name} {appt.lastName}
                          </p>
                          <p className="text-xs mt-0.5 text-gray-400">
                            {appt.service.name}
                          </p>
                        </div>
                        {remaining > 0 && total > 0 && (
                          <span className="shrink-0 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-full">
                            falta {money(remaining)}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {i < dayAppts.length - 1 && gapMinutes(appt, dayAppts[i + 1]) >= 90 && (
                  <div className="flex items-stretch min-h-[36px] border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-black/10">
                    <div className="w-14 shrink-0" />
                    <div className="flex-1 py-1 pr-3 flex items-center">
                      <span className="text-xs text-gray-300 dark:text-gray-600 italic pl-1">
                        pausa
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
