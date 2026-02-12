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
  Instagram,
} from "lucide-react";

type Service = { id: string; name: string };

type Appointment = {
  id: string;
  date?: string;
  status?: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
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
  const [instagram, setInstagram] = useState("");
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
        setInstagram(a.instagram ?? "");
        setServiceId(a.service?.id ?? "");
        setStatus(a.status ?? "pendiente");

        if (a.date) {
          const d = new Date(a.date);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const mi = String(d.getMinutes()).padStart(2, "0");

            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(`${hh}:${mi}`);
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
    if (!name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        lastName: lastName.trim(),
        telefono: telefono.trim() || null,
        instagram: instagram.trim() || null,
        serviceId,
        status,
      };

      if (date && time) {
        payload.date = date;
        payload.time = time;
      }

      await axios.put(`/api/appointments?id=${id}`, payload);
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

        {/* Todos los fields incluyendo Instagram */}

        {/* ... (se mantiene exactamente igual que el código que me pasaste) */}

      </div>
    </div>
  );
}
