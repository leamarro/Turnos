"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CalendarModal({
  selectedDate,
  onClose,
  onSave,
  appointment, // si está presente, modo edición
}: {
  selectedDate: Date | null;
  onClose: () => void;
  onSave: () => void;
  appointment?: any;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/services").then((res) => setServices(Array.isArray(res.data) ? res.data : [])).catch(() => {});

    // Si es edición, pre-cargamos datos
    if (appointment) {
      const d = new Date(appointment.date);
      setTime(format(d, "HH:mm"));
      setServiceId(appointment.serviceId);
      setStatus(appointment.status);
    }
  }, [appointment]);

  if (!selectedDate && !appointment) return null;

  async function handleSave() {
    setLoading(true);
    const dateStr = appointment
      ? format(new Date(appointment.date), "yyyy-MM-dd")
      : format(selectedDate!, "yyyy-MM-dd");

    const fullDate = new Date(`${dateStr}T${time}`);

    try {
      if (appointment) {
        // modo edición
        await axios.patch("/api/appointments", {
          id: appointment.id,
          date: fullDate,
          serviceId,
          status,
        });
      } else {
        // modo creación
        await axios.post("/api/appointments", {
          date: fullDate,
          serviceId,
        });
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el turno");
    } finally {
      setLoading(false);
    }
  }

  const formattedDate = appointment
    ? format(new Date(appointment.date), "dd/MM/yyyy", { locale: es })
    : selectedDate
    ? format(selectedDate, "dd/MM/yyyy", { locale: es })
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {appointment ? "Editar Turno" : "Nuevo Turno"}
        </h2>

        <p className="text-center text-sm text-gray-500 mb-4">
          {formattedDate}
        </p>

        <label className="block mb-2 text-sm font-medium">Hora</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
        />

        <label className="block mb-2 text-sm font-medium">Servicio</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
        >
          <option value="">Seleccionar servicio</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {appointment && (
          <>
            <label className="block mb-2 text-sm font-medium">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!time || !serviceId || loading}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80"
          >
            {appointment ? "Guardar Cambios" : "Crear Turno"}
          </button>
        </div>
      </div>
    </div>
  );
}
