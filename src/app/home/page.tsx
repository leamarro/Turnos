"use client";

export const dynamic = "force-dynamic";

import CalendarGrid from "@/components/CalendarGrid";
import DayView from "@/components/DayView";
import AvailabilityView from "@/components/AvailabilityView";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  { key: "week", label: "Semana" },
  { key: "day", label: "Día" },
  { key: "available", label: "Disponibles" },
];

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<View>("month");
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

  return (
    <div className="max-w-4xl mx-auto px-3 pt-4 pb-4">
      {/* HEADER */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-semibold">Agenda</h1>
      </div>

      {/* TOGGLE VIEWS */}
      <div className="flex justify-center gap-1.5 mb-5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              view === v.key
                ? "bg-black text-white"
                : "border border-gray-200 text-gray-600"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* VISTAS */}
      {(view === "month" || view === "week") && (
        <CalendarGrid
          appointments={calendarAppointments}
          view={view}
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
