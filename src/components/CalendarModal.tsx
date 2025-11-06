"use client";

import { format } from "date-fns";

export default function CalendarModal({ date, appointments, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative p-6 animate-fade-in">
        
        {/* ❌ Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-light transition-colors"
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Turnos del {format(date, "dd/MM/yyyy")}
        </h2>

        {appointments.length > 0 ? (
          <ul className="space-y-2">
            {appointments.map((a: any) => (
              <li
                key={a.id}
                className="p-3 bg-gray-100 rounded-md text-sm flex justify-between"
              >
                <span>{a.service?.name ?? a.serviceId}</span>
                <span>
                  {new Date(a.date).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No hay turnos para este día.</p>
        )}
      </div>
    </div>
  );
}
