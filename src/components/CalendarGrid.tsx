"use client";

import { useState } from "react";
import CalendarModal from "./CalendarModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: string;
  service: { name: string };
  user: { name: string };
}

interface Props {
  appointments: Appointment[];
}

export function CalendarGrid({ appointments }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName =
    format(new Date(currentYear, currentMonth), "MMMM", { locale: es })
      .charAt(0)
      .toUpperCase() +
    format(new Date(currentYear, currentMonth), "MMMM", { locale: es }).slice(1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="text-[#111] text-xl font-light hover:opacity-60 transition"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {monthName} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-[#111] text-xl font-light hover:opacity-60 transition"
        >
          →
        </button>
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 mt-4">
        {days.map((day) => {
          const date = new Date(currentYear, currentMonth, day);
          const dateKey = date.toISOString().split("T")[0];
          const isToday = date.toDateString() === today.toDateString();
          const dayAppointments = appointments.filter((a) =>
            a.date.startsWith(dateKey)
          );

          return (
            <div
              key={day}
              onClick={() => handleDayClick(date)}
              className={`cursor-pointer rounded-xl border p-2 sm:p-4 text-center transition 
                ${
                  isToday
                    ? "bg-[#f0efec] border-black"
                    : "bg-[#fafafa] hover:bg-[#f5f3ef]"
                }`}
            >
              <p className="font-semibold">{day}</p>

              {dayAppointments.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {dayAppointments.length} turno
                  {dayAppointments.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de turnos */}
      {isModalOpen && selectedDate && (
        <CalendarModal
          date={selectedDate}
          appointments={appointments}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
