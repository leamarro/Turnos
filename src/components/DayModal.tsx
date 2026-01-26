"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import TimePicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

type Service = {
  id: string;
  name: string;
};

export default function AppointmentForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/api/services").then((res) => setServices(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !telefono || !date || !time || !serviceId) {
      setMessage("Por favor completá todos los campos.");
      return;
    }

    try {
      const dateTime = new Date(
  Number(date.split("-")[0]),
  Number(date.split("-")[1]) - 1,
  Number(date.split("-")[2]),
  Number(time.split(":")[0]),
  Number(time.split(":")[1])
);


      await axios.post("/api/appointments", {
        user: {
          name,
          lastName,
          telefono,
        },
        serviceId,
        date: dateTime.toISOString(),
      });

      setMessage("✅ Turno reservado con éxito!");

      setName("");
      setLastName("");
      setTelefono("");
      setDate("");
      setTime(null);
      setServiceId("");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al reservar el turno.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Reservar Turno
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-xl p-2"
        />

        <input
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded-xl p-2"
        />

        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full border rounded-xl p-2"
        />

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full border rounded-xl p-2"
        >
          <option value="">Seleccioná un servicio</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-xl p-2"
        />

        <TimePicker
          value={time}
          onChange={setTime}
          disableClock
          format="HH:mm"
        />

        <button className="w-full bg-black text-white py-2 rounded-xl">
          Confirmar turno
        </button>

        {message && <p className="text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
