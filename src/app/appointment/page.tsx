"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AppointmentForm() {
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // Cargar servicios
  // ==========================
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await axios.get("/api/services");
        setServices(res.data);
      } catch (err) {
        console.error("Error cargando servicios:", err);
      }
    }
    fetchServices();
  }, []);

  // ==========================
  // Enviar formulario
  // ==========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !telefono || !date || !time || !serviceId) {
      setError("Por favor completá todos los campos");
      return;
    }

    try {
      setLoading(true);

      // Crear fecha + hora combinada
      const combinedDate = new Date(`${date}T${time}:00`);

      await axios.post("/api/appointments", {
        name,
        telefono,
        date: combinedDate.toISOString(),
        serviceId,
      });

      setSuccess(true);
      setName("");
      setTelefono("");
      setDate("");
      setTime("");
      setServiceId("");
    } catch (err) {
      setError("Error al agendar el turno");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6">Agendar turno</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Tu nombre"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Ej: 1123456789"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium mb-1">Hora</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium mb-1">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white"
          >
            <option value="">Seleccionar servicio</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mensajes */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Turno agendado ✅</p>}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2 hover:opacity-90 transition"
        >
          {loading ? "Guardando..." : "Agendar turno"}
        </button>
      </form>
    </div>
  );
}
