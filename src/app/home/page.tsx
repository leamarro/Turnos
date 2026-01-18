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
};

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<"week" | "month">("month");
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await fetch("/api/appointments");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setAppointments([]);
        return;
      }

      const formatted: Appointment[] = data.map((a: any) => ({
        id: a.id,
        date: new Date(a.date).toISOString(),
        service: { name: a.service?.name ?? "" },
        user: {
          name: a.user?.name ?? "",
          lastName: a.user?.lastName ?? "",
        },
      }));

      setAppointments(formatted);
    };

    fetchAppointments();
  }, []);

  const handleSelectAppointment = (id: string) => {
    router.push(`/appointments/${id}`);
  };

  return (
    <div className="py-6 px-3 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">
        Agenda de Turnos
      </h1>

      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => setView("month")}
          className={`px-4 py-2 rounded-lg ${
            view === "month" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Mes
        </button>

        <button
          onClick={() => setView("week")}
          className={`px-4 py-2 rounded-lg ${
            view === "week" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Semana
        </button>
      </div>

      <CalendarGrid
        appointments={appointments}
        view={view}
        onSelectAppointment={handleSelectAppointment}
      />
    </div>
  );
}
