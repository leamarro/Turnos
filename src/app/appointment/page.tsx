"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function AppointmentPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchServices() {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    }
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, date, serviceId: selectedService }),
      });

      if (!res.ok) throw new Error("Error al crear el turno");

      setMessage("✅ Turno reservado correctamente");
      setName("");
      setEmail("");
      setDate("");
      setSelectedService("");
    } catch (error) {
      setMessage("❌ Ocurrió un error al reservar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Reservar Turno</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 border border-gray-200 shadow-sm rounded-2xl p-6 w-full max-w-md space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha y hora</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Servicio</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          >
            <option value="">Elegí un servicio...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — ${service.price}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-2 mt-4 hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Reservando..." : "Reservar turno"}
        </button>

        {message && (
          <p className="text-center text-sm mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
