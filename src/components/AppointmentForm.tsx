"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
};

export default function AppointmentForm() {
  const router = useRouter();
const isMobile =
  typeof window !== "undefined" &&
  /Android|iPhone|iPad/i.test(navigator.userAgent);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/api/services").then((res) => {
      setServices(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !lastName || !telefono || !date || !time || !serviceId) {
      setMessage("Por favor completá todos los campos.");
      return;
    }

    try {
      const dateTime = new Date(`${date}T${time}`);

      const res = await axios.post("/api/appointments", {
        name,
        lastName,
        telefono,
        serviceId,
        date: dateTime.toISOString(),
        status: "confirmed",
      });

      router.push(`/appointments/${res.data.id}`);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al reservar el turno.");
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 pt-8 sm:pt-16">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Reservar turno
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Input
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs text-gray-500">
              Servicio
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="minimal-input"
            >
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* FECHA */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="minimal-input"
            />
          </div>

          {/* HORA */}
<div className="space-y-1">
  <label className="text-xs text-gray-500">Hora</label>

  {isMobile ? (
    <input
      type="time"
      value={time}
      onChange={(e) => setTime(e.target.value)}
      className="minimal-input"
    />
  ) : (
    <input
      type="text"
      placeholder="HH:mm"
      value={time}
      onChange={(e) => setTime(e.target.value)}
      className="minimal-input"
    />
  )}
</div>


          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Confirmar turno
          </button>

          {message && (
            <p className="text-center text-sm text-red-500">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ===================== */
/* INPUT MINIMAL */
/* ===================== */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        className="minimal-input"
      />
    </div>
  );
}
