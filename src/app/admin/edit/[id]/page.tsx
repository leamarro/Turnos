"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Service = { id: string; name: string };
type Appointment = {
  id: string;
  date: string;
  status: string;
  user: { id: string; name: string; telefono: string };
  service: { id: string; name: string };
};

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  // Campos editables
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadData() {
      const ap = await axios.get(`/api/appointments?id=${id}`);
      const sv = await axios.get("/api/services");

      const a = ap.data;
      setAppointment(a);

      setName(a.user.name);
      setTelefono(a.user.telefono);
      setServiceId(a.service.id);

      // separar fecha y hora
      const d = new Date(a.date);
      setDate(d.toISOString().slice(0, 10));
      setTime(d.toTimeString().slice(0, 5));

      setStatus(a.status);

      setServices(sv.data);
    }

    loadData();
  }, [id]);

  async function handleSave() {
    if (!name.trim() || !telefono.trim()) {
      alert("El nombre y teléfono no pueden estar vacíos.");
      return;
    }

    try {
      await axios.put(`/api/appointments?id=${id}`, {
        name,
        telefono,
        serviceId,
        date,
        time,
        status,
      });

      alert("Turno actualizado correctamente");
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar el turno definitivamente?")) return;

    try {
      await axios.delete("/api/appointments", { data: { id } });
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el turno");
    }
  }

  if (!appointment) return <p className="p-4">Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow space-y-4 mt-6">
      <h2 className="text-xl font-bold text-center mb-2">Editar turno</h2>

      {/* Nombre */}
      <label className="block text-sm font-medium">
        Nombre
        <input
          className="mt-1 block w-full border rounded-lg p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {/* Teléfono */}
      <label className="block text-sm font-medium">
        Teléfono
        <input
          className="mt-1 block w-full border rounded-lg p-2"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </label>

      {/* Servicio */}
      <label className="block text-sm font-medium">
        Servicio
        <select
          className="mt-1 block w-full border rounded-lg p-2"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {/* Fecha y hora */}
      <div className="flex gap-4">
        <label className="block flex-1 text-sm font-medium">
          Fecha
          <input
            type="date"
            className="mt-1 block w-full border rounded-lg p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="block flex-1 text-sm font-medium">
          Hora
          <input
            type="time"
            className="mt-1 block w-full border rounded-lg p-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>

      {/* Estado */}
      <label className="block text-sm font-medium">
        Estado
        <select
          className="mt-1 block w-full border rounded-lg p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </label>

      {/* Botones */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Guardar cambios
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Eliminar turno
        </button>
      </div>
    </div>
  );
}
