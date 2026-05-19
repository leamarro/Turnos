"use client";

export const dynamic = "force-dynamic";

import CalendarGrid from "@/components/CalendarGrid";
import DayView from "@/components/DayView";
import AvailabilityView from "@/components/AvailabilityView";
import WeekGridView from "@/components/WeekGridView";
import CalendarMonthGrid from "@/components/CalendarMonthGrid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, CalendarDays } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string };
  timeStatus: "past" | "today" | "future";
};

type View = "month" | "week" | "day" | "available";

const VIEWS: { key: View; label: string }[] = [
  { key: "month", label: "Mes" },
  { key: "day", label: "Día" },
  { key: "available", label: "Disponibles" },
];

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<View>("month");
  const [gridMode, setGridMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        if (!Array.isArray(data)) { setAppointments([]); return; }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setAppointments(data.map((a: any) => {
          const date = new Date(a.date);
          const compareDate = new Date(date);
          compareDate.setHours(0, 0, 0, 0);

          let timeStatus: "past" | "today" | "future" = "future";
          if (compareDate.getTime() === today.getTime()) timeStatus = "today";
          else if (compareDate < today) timeStatus = "past";

          return {
            id: a.id,
            date: date.toISOString(),
            name: a.name ?? "",
            lastName: a.lastName ?? "",
            service: { name: a.service?.name ?? "" },
            timeStatus,
          };
        }));
      } catch {
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, []);

  const handleSelect = (id: string) => router.push(`/appointments/${id}`);

  // CalendarGrid espera { user: { name, lastName } } — adaptamos
  const calendarAppointments = appointments.map((a) => ({
    id: a.id,
    date: a.date,
    service: a.service,
    user: { name: a.name, lastName: a.lastName },
  }));

  const todayCount = appointments.filter((a) => a.timeStatus === "today").length;

  return (
    <div className="max-w-4xl mx-auto px-3 pt-4 pb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Agenda</h1>
          <p className="text-sm mt-0.5 font-medium">
            {todayCount > 0 ? (
              <span className="text-black">
                Hoy · {todayCount} {todayCount === 1 ? "turno" : "turnos"}
              </span>
            ) : (
              <span className="text-gray-400">Hoy · sin turnos</span>
            )}
          </p>
        </div>

        {/* Toggle lista / grilla — solo para Mes */}
        {view === "month" && (
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setGridMode(false)}
              className={`p-1.5 rounded-lg transition ${!gridMode ? "bg-white shadow-sm" : "text-gray-400"}`}
              title="Vista lista"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setGridMode(true)}
              className={`p-1.5 rounded-lg transition ${gridMode ? "bg-white shadow-sm" : "text-gray-400"}`}
              title="Vista calendario"
            >
              <CalendarDays size={16} />
            </button>
          </div>
        )}
      </div>

      {/* TOGGLE VIEWS — scroll horizontal en mobile */}
      <div className="overflow-x-auto scrollbar-hide mb-5">
        <div className="flex gap-1.5 w-max mx-auto px-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => { setView(v.key); if (v.key !== "month") setGridMode(false); }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                view === v.key
                  ? "bg-black text-white"
                  : "border border-gray-200 text-gray-600"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* VISTAS */}
      {view === "month" && !gridMode && (
        <CalendarGrid
          appointments={calendarAppointments}
          view="month"
          onSelectAppointment={handleSelect}
        />
      )}

      {view === "month" && gridMode && (
        <CalendarMonthGrid
          appointments={calendarAppointments}
          onSelectAppointment={handleSelect}
        />
      )}

      {view === "day" && (
        <DayView
          appointments={appointments}
          onSelectAppointment={handleSelect}
        />
      )}

      {view === "available" && (
        <AvailabilityView
          appointments={appointments}
          onSelectAppointment={handleSelect}
        />
      )}
    </div>
  );
}
