"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  user: { name: string; lastName: string };
  service: { name: string; color?: string; id?: string };
};

export default function CalendarGrid({
  appointments,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  view?: string;
  onSelectAppointment?: (id: string) => void;
}) {
  const today = startOfDay(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPastDays, setShowPastDays] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 640);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const allDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const days = isMobile && !showPastDays
    ? allDays.filter((d) => d >= today)
    : allDays;

  const getAppointmentsByDay = (day: Date) =>
    appointments
      .filter((a) => format(new Date(a.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const prev = () => setCurrentDate((d) => addDays(startOfMonth(d), -1));
  const next = () => setCurrentDate((d) => addDays(endOfMonth(d), 1));
  const goToday = () => { setCurrentDate(new Date()); setShowPastDays(false); };

  if (!isClient) return null;

  /* ================= MOBILE — lista vertical ================= */
  if (isMobile) {
    return (
      <div className="relative space-y-3 mt-2 pt-1 pb-4">
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="p-2 active:bg-gray-100 rounded-full transition">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <h2 className="font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button onClick={next} className="p-2 active:bg-gray-100 rounded-full transition">
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filtro días anteriores */}
        <div>
          <button
            onClick={() => setShowPastDays((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full border transition active:scale-95 ${
              showPastDays ? "bg-black text-white border-black" : "border-gray-300 text-gray-600"
            }`}
          >
            {showPastDays ? "Ocultar días anteriores" : "Ver días anteriores"}
          </button>
        </div>

        {/* Tarjetas por día */}
        {days.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isPast = day < today && !isToday;

          return (
            <div
              key={day.toISOString()}
              className={`bg-white rounded-2xl p-4 shadow-sm ${isPast ? "opacity-50" : ""}`}
            >
              <h3 className="flex items-center gap-2 font-medium mb-3 capitalize">
                <span className="text-gray-600">{format(day, "EEEE", { locale: es })}</span>
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isToday ? "bg-black text-white" : "text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </h3>

              {items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sin turnos</p>
              ) : (
                <div className="space-y-2">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => onSelectAppointment?.(a.id)}
                      className="bg-gray-50 rounded-xl px-3 py-3 cursor-pointer active:bg-gray-100 transition overflow-hidden relative"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: a.service.color || "#000000" }} />
                      <div className="flex justify-between items-center pl-2">
                        <div>
                          <p className="text-sm font-medium">
                            {a.user.name} {a.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{a.service.name}</p>
                        </div>
                        <p className="text-sm font-bold tabular-nums text-gray-700">
                          {format(new Date(a.date), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Botón Hoy */}
        <button
          onClick={goToday}
          className="fixed bottom-24 right-4 sm:bottom-6 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium active:scale-95 transition"
        >
          Hoy
        </button>
      </div>
    );
  }

  /* ================= DESKTOP — grilla ================= */
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const desktopDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const startOffset = (startOfMonth(currentDate).getDay() + 6) % 7;

  return (
    <div className="relative space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="text-gray-500 hover:text-black text-lg px-2">←</button>
        <h2 className="font-semibold capitalize text-lg">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={goToday} className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
            Hoy
          </button>
          <button onClick={next} className="text-gray-500 hover:text-black text-lg px-2">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-transparent" />
        ))}
        {desktopDays.map((day) => {
          const items = getAppointmentsByDay(day);
          const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isPast = day < today;
          return (
            <div key={day.toISOString()} className={`min-h-[100px] rounded-xl p-2 border transition ${isToday ? "bg-white border-black shadow-sm" : isPast ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200 hover:border-gray-400"}`}>
              <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-black text-white" : "text-gray-700"}`}>
                {format(day, "d")}
              </span>
              <div className="space-y-1">
                {items.slice(0, 3).map((a) => (
                  <div key={a.id} onClick={() => onSelectAppointment?.(a.id)} className="text-[11px] rounded-md px-1.5 py-1 cursor-pointer hover:opacity-80 transition truncate flex items-center gap-1" title={`${a.user.name} ${a.user.lastName}`} style={{ backgroundColor: a.service.color ? `${a.service.color}20` : "#f3f4f6", borderLeft: `3px solid ${a.service.color || "#000000"}` }}>
                    <span className="font-medium">{format(new Date(a.date), "HH:mm")}</span>{" "}
                    <span className="text-gray-600">{a.user.name}</span>
                  </div>
                ))}
                {items.length > 3 && <p className="text-[11px] text-gray-400 pl-1">+{items.length - 3} más</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
