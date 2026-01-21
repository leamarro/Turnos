"use client";

export const dynamic = "force-dynamic";

import CalendarGrid from "@/components/CalendarGrid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  date: string;
  service: {
    name: string;
  };
  user: {
    name: string;
    lastName: string;
  };
  timeStatus: "past" | "today" | "future";
};

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<"week" | "month">("month");
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();

        if (!Array.isArray(data)) {
          setAppointments([]);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatted: Appointment[] = data.map((a: any) => {
          const date = new Date(a.date);
          const compareDate = new Date(date);
          compareDate.setHours(0, 0, 0, 0);

          let timeStatus: "past" | "today" | "future" = "future";

          if (compareDate.getTime() === today.getTime()) {
            timeStatus = "today";
          } else if (compareDate < today) {
            timeStatus = "past";
          }

          return {
            id: a.id,
            date: date.toISOString(),
            service: { name: a.service?.name ?? "" },
            user: {
              name: a.user?.name ?? "",
              lastName: a.user?.lastName ?? "",
            },
            timeStatus,
          };
        });

        setAppointments(formatted);
      } catch (error) {
        console.error("ERROR FETCH APPOINTMENTS:", error);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, []);

  const handleSelectAppointment = (id: string) => {
    router.push(`/appointments/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 pt-4 pb-16">
      {/* HEADER */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-semibold">Agenda</h1>
        <p className="text-sm text-gray-500">Turnos programados</p>
      </div>

      {/* TOGGLE VIEW */}
      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => setView("month")}
          className={`px-4 py-1.5 rounded-full text-sm transition ${
            view === "month"
              ? "bg-black text-white"
              : "border text-gray-600 hover:bg-gray-100"
          }`}
        >
          Mes
        </button>

        <button
          onClick={() => setView("week")}
          className={`px-4 py-1.5 rounded-full text-sm transition ${
            view === "week"
              ? "bg-black text-white"
              : "border text-gray-600 hover:bg-gray-100"
          }`}
        >
          Semana
        </button>
      </div>

      {/* CALENDAR */}
      <CalendarGrid
        appointments={appointments}
        view={view}
        onSelectAppointment={handleSelectAppointment}
      />
    </div>
  );
}
