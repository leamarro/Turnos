"use client";

export const dynamic = "force-dynamic";

import CalendarGrid from "@/components/CalendarGrid";
import DayView from "@/components/DayView";
import AvailabilityView from "@/components/AvailabilityView";
import WeekGridView from "@/components/WeekGridView";
import CalendarMonthGrid from "@/components/CalendarMonthGrid";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, CalendarDays, Loader2 } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  name: string;
  lastName: string;
  service: { name: string; color: string; id: string };
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 72;

  const fetchAppointments = useCallback(async () => {
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
          service: {
            name: a.service?.name ?? "",
            color: a.service?.color ?? "#000000",
            id: a.service?.id ?? "",
          },
          timeStatus,
        };
      }));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dist = e.changedTouches[0].clientY - touchStartY.current;
    if (dist > PULL_THRESHOLD && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      fetchAppointments();
    }
  };

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
    <div
      className="max-w-4xl mx-auto px-3 pt-4 pb-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* PULL TO REFRESH */}
      {refreshing && (
        <div className="flex justify-center items-center gap-2 py-2 mb-2 text-xs text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Actualizando…
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Agenda</h1>
          <p className="text-sm mt-0.5 font-medium">
            {loading ? (
              <span className="inline-block h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
            ) : todayCount > 0 ? (
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

      {/* SKELETON de carga */}
      {loading && (
        <div className="space-y-3 mt-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-20 bg-gray-100 rounded-full" />
                <div className="h-7 w-7 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-gray-50 rounded-xl" />
                {i === 1 && <div className="h-12 bg-gray-50 rounded-xl" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTAS */}
      {!loading && view === "month" && !gridMode && (
        <CalendarGrid
          appointments={calendarAppointments}
          view="month"
          onSelectAppointment={handleSelect}
        />
      )}

      {!loading && view === "month" && gridMode && (
        <CalendarMonthGrid
          appointments={calendarAppointments}
          onSelectAppointment={handleSelect}
        />
      )}

      {!loading && view === "day" && (
        <DayView
          appointments={appointments}
          onSelectAppointment={handleSelect}
        />
      )}

      {!loading && view === "available" && (
        <AvailabilityView
          appointments={appointments}
          onSelectAppointment={handleSelect}
        />
      )}
    </div>
  );
}
