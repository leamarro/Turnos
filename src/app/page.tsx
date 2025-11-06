"use client";


import { CalendarGrid } from "@/components/CalendarGrid";
import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  date: string;
  time: string;
  service: {
    name: string;
  };
  user: {
    name: string;
  };
};

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await fetch("/api/appointments");
      const data = await res.json();

      // 🔧 Convertimos la fecha a string ISO si viene como objeto Date
      const formatted = data.map((a: any) => ({
        ...a,
        date: new Date(a.date).toISOString(),
      }));

      setAppointments(formatted);
    };

    fetchAppointments();
  }, []);

  return (
    <div className="py-6 sm:py-10 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
        Agenda de Turnos
      </h1>
      <CalendarGrid appointments={appointments} />
    </div>
  );
}
