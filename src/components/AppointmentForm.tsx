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

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState(""); // solo números
  const [instagram, setInstagram] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  /* ===================== */
  /* CARGAR SERVICIOS */
  /* ===================== */
  useEffect(() => {
    axios.get("/api/services").then((res) => {
      setServices(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  /* ===================== */
  /* HORA */
  /* ===================== */
function formatTime(value: string) {
  let v = value.replace(/[^\d]/g, "");
  if (v.length >= 3) v = v.slice(0, 2) + ":" + v.slice(2, 4);
  return v.slice(0, 5);
}

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
      setMessage("Completá todos los campos obligatorios.");
      return;
    }

    if (!isValidTime(time)) {
      setMessage("Hora inválida (HH:mm)");
      return;
    }

    try {
      const dateTime = new Date(`${date}T${time}`);

      // formateo teléfono final
      const telefonoFinal = telefono.startsWith("54")
        ? `+${telefono}`
        : `+54${telefono}`;

      const res = await axios.post("/api/appointments", {
        name,
        lastName,
        telefono: telefonoFinal,
        instagram: instagram || null,
        serviceId,
        date: dateTime.toISOString(),
        status: "confirmado",
      });

      router.push(`/appointments/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al reservar el turno");
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 px-4 pt-12">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Reservar turno
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input placeholder="Nombre" value={name} onChange={setName} />
          <Input placeholder="Apellido" value={lastName} onChange={setLastName} />

          {/* TELÉFONO */}
          <Input
            placeholder="Teléfono (ej: 1123456789)"
            value={telefono}
            onChange={(v) => {
              const onlyNumbers = v.replace(/[^\d]/g, "");
              setTelefono(onlyNumbers);
            }}
          />

          {/* INSTAGRAM */}
          <Input
            placeholder="Instagram (opcional)"
            value={instagram}
            onChange={(v) => {
              if (!v) return setInstagram("");
              setInstagram("@" + v.replace(/@+/g, ""));
            }}
          />

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

{/* HORA – sin input nativo */}
<div className="space-y-1">
  <label className="text-xs text-gray-500">Hora</label>

  <div
    contentEditable
    suppressContentEditableWarning
    inputMode="numeric"
    className="minimal-input"
    onInput={(e) => {
      const text = e.currentTarget.textContent || "";
      setTime(formatTime(text));
      e.currentTarget.textContent = formatTime(text);
    }}
    onBlur={(e) => {
      if (!isValidTime(time)) {
        e.currentTarget.textContent = "";
        setTime("");
      }
    }}
  >
    {time}
  </div>
</div>


          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-medium"
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
/* INPUT */
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
