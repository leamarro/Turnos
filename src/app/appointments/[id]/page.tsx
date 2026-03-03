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
  FileText,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  price?: number;
};

type Payment = {
  id: string;
  amount: number;
};

type Appointment = {
  id: string;
  date?: string;
  status?: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  notes?: string;
  servicePrice?: number | null;
  service?: Service | null;
  payments?: Payment[];
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
  const [depositAmount, setDepositAmount] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("confirmado");

  useEffect(() => {
    async function loadData() {
      try {
        // 🔥 CORREGIDO
        const ap = await axios.get(`/api/appointments/${id}`);
        const sv = await axios.get("/api/services");

        const a: Appointment = ap.data;

        setAppointment(a);
        setServices(Array.isArray(sv.data) ? sv.data : []);

        setName(a.name ?? "");
        setLastName(a.lastName ?? "");
        setTelefono(a.telefono ?? "");
        setInstagram(a.instagram ?? "");
        setNotes(a.notes ?? "");
        setServiceId(a.service?.id ?? "");
        setStatus(a.status ?? "confirmado");

        if (a.date) {
          const d = new Date(a.date);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const mi = String(d.getMinutes()).padStart(2, "0");

          setDate(`${yyyy}-${mm}-${dd}`);
          setTime(`${hh}:${mi}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error al cargar el turno");
      }
    }

    loadData();
  }, [id]);

  if (!appointment) {
    return <p className="p-6 text-center text-gray-500">Cargando…</p>;
  }

  // 🔥 CÁLCULOS FINANCIEROS
  const totalServicio = appointment.servicePrice ?? 0;
  const totalPagado =
    appointment.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
  const restante = totalServicio - totalPagado;

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
        notes: notes.trim() || null,
        serviceId,
        status,
      };

      if (date && time) {
        payload.date = new Date(`${date}T${time}`);
      }

      await axios.put(`/api/appointments/${id}`, payload);

      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  }

  async function handleAddDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;

    try {
      await axios.post(`/api/appointments/${id}/add-deposit`, {
        amount: Number(depositAmount),
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error al agregar seña");
    }
  }

  async function handleCompletePayment() {
    try {
      await axios.post(`/api/appointments/${id}/complete-payment`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error al completar pago");
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar el turno definitivamente?")) return;

    try {
      await axios.delete(`/api/appointments/${id}`);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 sm:pt-16">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <h1 className="text-lg font-semibold text-center">
          Editar turno
        </h1>

        {/* DATOS */}
        <Field icon={<User size={16} />} label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>

        <Field icon={<User size={16} />} label="Apellido">
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" />
        </Field>

        <Field icon={<Phone size={16} />} label="Teléfono">
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="input" />
        </Field>

        <Field icon={<Instagram size={16} />} label="Instagram">
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input" />
        </Field>

        <Field icon={<FileText size={16} />} label="Notas">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
        </Field>

        <Field icon={<Sparkles size={16} />} label="Servicio">
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input">
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        {/* RESUMEN FINANCIERO */}
        <div className="bg-gray-100 p-4 rounded-xl text-sm space-y-1">
          <p>Total servicio: ${totalServicio}</p>
          <p>Total pagado: ${totalPagado}</p>
          <p className="font-semibold text-red-600">
            Restante: ${restante}
          </p>
        </div>

        {/* AGREGAR SEÑA */}
        <Field icon={<BadgeCheck size={16} />} label="Agregar seña">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input"
            placeholder="Monto"
          />
        </Field>

        <button
          onClick={handleAddDeposit}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          Agregar seña
        </button>

        {/* COMPLETAR PAGO */}
        {restante > 0 && (
          <button
            onClick={handleCompletePayment}
            className="w-full bg-green-600 text-white py-2 rounded-xl"
          >
            Completar pago
          </button>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-red-600 w-full"
          >
            <Trash2 size={16} />
            Eliminar
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white w-full"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

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
