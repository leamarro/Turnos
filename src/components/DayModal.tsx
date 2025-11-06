"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AppointmentForm() {
  const [services, setServices] = useState<any[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await axios.get("/api/services");
        setServices(res.data);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      }
    }
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId || !name || !phone || !date || !time) {
      setMessage("Por favor completá todos los campos.");
      return;
    }

    try {
      const dateTime = new Date(`${date}T${time}`);
      await axios.post("/api/appointments", {
        user: { name, phone },
        service: { id: serviceId },
        date: dateTime,
      });

      setMessage("✅ Turno reservado con éxito!");
      setName("");
      setPhone("");
      setDate("");
      setTime("");
      setServiceId("");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al reservar el turno.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4 text-[#111]">
        Reservar Turno
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#111]">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b996] bg-white transition"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#111]">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 2914567890"
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b996] bg-white transition"
          />
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#111]">
            Servicio
          </label>
          <div className="relative">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b996] bg-white pr-8 appearance-none"
            >
              <option value="">Seleccioná un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#111]">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b996] bg-white transition"
          />
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#111]">
            Hora
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b996] bg-white transition"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-[#d4b996] hover:bg-[#c3a87e] text-white font-medium py-2.5 rounded-xl transition"
        >
          Confirmar Turno
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
