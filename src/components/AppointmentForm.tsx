"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
};

export default function AppointmentForm() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [message, setMessage] = useState("");

  /* ===================== */
  /* DETECTAR MOBILE */
  /* ===================== */
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  /* ===================== */
  /* CARGAR SERVICIOS */
  /* ===================== */
  useEffect(() => {
    axios.get("/api/services").then((res) => {
      setServices(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  /* ===================== */
  /* VALIDAR HORA */
  /* ===================== */
  function isValidTime(value: string) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  /* ===================== */
  /* SUBMIT */
  /* ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !lastName || !telefono || !date || !time || !serviceId) {
      setMessage("Por favor completá todos los campos.");
      return;
    }

    if (!isValidTime(time)) {
      setMessage("Hora inválida. Usá formato HH:mm");
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
        status: "confirmado", // 👈 confirmado directo
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
          <Input placeholder="Nombre" value={name} onChange={setName} />
          <Input placeholder="Apellido" value={lastName} onChange={setLastName} />
          <Input placeholder="Teléfono" value={telefono} onChange={setTelefono} />

          {/* SERVICIO */}
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

          {/* FECHA */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="minimal-input"
            />
          </div>

          {/* HORA (MAGIA 🔥) */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Hora</label>

            {isMobile ? (
              /* 📱 Mobile → picker nativo */
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="minimal-input"
              />
            ) : (
              /* 💻 Desktop → input limpio */
              <input
                type="text"
                placeholder="HH:mm"
                value={time}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d:]/g, "");
                  setTime(v);
                }}
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
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="minimal-input"
    />
  );
}
