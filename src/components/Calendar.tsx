"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get("/api/appointments");
        setAppointments(res.data);
      } catch (error) {
        console.error("Error al obtener los turnos:", error);
      }
    }
    fetchAppointments();
  }, []);

  const occupiedDates = appointments.map((a) => new Date(a.date));

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Calendario de Turnos
      </h2>

      {/* === Calendario === */}
      <div className="text-center">
        <DayPicker
          mode="single"
          locale={es}
          selected={selectedDay}
          onSelect={setSelectedDay}
          modifiers={{
            ocupado: (day) => occupiedDates.some((d) => isSameDay(d, day)),
          }}
          modifiersClassNames={{
            ocupado: "rdp-day_occupied",
          }}
          styles={{
            caption_label: { textTransform: "capitalize" },
          }}
        />
      </div>

      {/* === Turnos del día seleccionado === */}
      {selectedDay && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-semibold mb-3 text-center">
            Turnos del {format(selectedDay, "dd/MM/yyyy")}
          </h3>

          <ul className="space-y-2">
            {appointments
              .filter((a) => isSameDay(new Date(a.date), selectedDay))
              .map((a) => (
                <li
                  key={a.id}
                  className="p-3 bg-[#f5f3ef] rounded-md text-sm flex justify-between items-center"
                >
                  <span className="font-medium">
                    {a.service?.name ?? a.serviceId}
                  </span>
                  <span className="text-gray-700">
                    {format(new Date(a.date), "HH:mm")}
                  </span>
                </li>
              ))}

            {appointments.filter((a) => isSameDay(new Date(a.date), selectedDay))
              .length === 0 && (
              <p className="text-gray-500 text-sm text-center">
                No hay turnos para este día.
              </p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
