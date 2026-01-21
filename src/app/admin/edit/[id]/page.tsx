"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Sparkles,
  CalendarClock,
  BadgeCheck,
  Trash2,
  Save,
} from "lucide-react";

type Service = { id: string; name: string };

type Appointment = {
  id: string;
  date?: string;
  status?: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  service?: { id: string; name?: string };
};

export default function EditAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const id = params.id;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("pendiente");

  useEffect(() => {
    async function loadData() {
      try {
        const ap = await axios.get(`/api/appointments?id=${id}`);
        const sv = await axios.get("/api/services");

        const a: Appointment = ap.data;
        setAppointment(a);

        setName(a.name ?? "");
        setLastName(a.lastName ?? "");
        setTelefono(a.telefono ?? "");
        setServiceId(a.service?.id ?? "");
        setStatus(a.status ?? "pendiente");

        if (a.date) {
          const d = new Date(a.date);
          if (!isNaN(d.getTime())) {
            setDate(d.toISOString().slice(0, 10));
            setTime(d.toTimeString().slice(0, 5));
          }
        }

        setServices(Array.isArray(sv.data) ? sv.data : []);
      } catch (err) {
        console.error(err);
        alert("Error al cargar el turno");
      }
    }

    loadData();
  }, [id]);

  async function handleSave() {
    if (!name.trim() || !lastName.trim() || !telefono.trim()) {
      alert("Nombre, apellido y teléfono son obligatorios");
      return;
    }

    try {
      await axios.put(`/api/appointments?id=${id}`, {
        name: name.trim(),
        lastName: lastName.trim(),
        telefono: telefono.trim(),
        serviceId,
        date,
        time,
        status,
      });

      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar el turno definitivamente?")) return;

    try {
      await axios.delete(`/api/appointments?id=${id}`);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar");
    }
  }

  if (!appointment) {
    return <p className="p-6 text-center text-gray-500">Cargando…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 sm:pt-16">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-5">

        <h1 className="text-lg font-semibold text-center">
          Editar turno
        </h1>

        <Field icon={<User size={16} />} label="Nombre">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>

        <Field icon={<User size={16} />} label="Apellido">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input"
          />
        </Field>

        <Field icon={<Phone size={16} />} label="Teléfono">
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="input"
          />
        </Field>

        <Field icon={<Sparkles size={16} />} label="Servicio">
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="input"
          >
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex gap-3">
          <Field icon={<CalendarClock size={16} />} label="Fecha">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </Field>

          <Field icon={<CalendarClock size={16} />} label="Hora">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field icon={<BadgeCheck size={16} />} label="Estado">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </Field>

        <div className="flex justify-between gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-red-600 hover:bg-red-50 transition w-full"
          >
            <Trash2 size={16} />
            Eliminar
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition w-full"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ */
/* COMPONENTES UI */
/* ------------------ */

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 w-full">
      <label className="flex items-center gap-2 text-xs text-gray-500">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
