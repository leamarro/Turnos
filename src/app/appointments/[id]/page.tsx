"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  ChevronLeft,
  MessageCircle,
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
          setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
          setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error al cargar el turno");
      }
    }
    loadData();
  }, [id]);

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-400">Cargando…</p>
      </div>
    );
  }

  const totalServicio = Math.round(appointment.service?.price ?? appointment.servicePrice ?? 0);
  const precioOriginal = appointment.servicePrice ?? 0;
  const precioCambio = precioOriginal > 0 && precioOriginal !== totalServicio;
  const totalPagado = appointment.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
  const restante = totalServicio - totalPagado;

  async function handleSave() {
    if (!name.trim()) { alert("El nombre es obligatorio"); return; }
    try {
      const payload: any = {
        name: name.trim(), lastName: lastName.trim(),
        telefono: telefono.trim() || null, instagram: instagram.trim() || null,
        notes: notes.trim() || null, serviceId, status,
      };
      if (date && time) payload.date = new Date(`${date}T${time}`);
      await axios.put(`/api/appointments/${id}`, payload);
      router.push("/admin");
    } catch { alert("Error al guardar"); }
  }

  async function handleAddDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    try {
      await axios.post(`/api/appointments/${id}/add-deposit`, { amount: Number(depositAmount) });
      router.refresh();
    } catch { alert("Error al agregar seña"); }
  }

  async function handleCompletePayment() {
    try {
      await axios.post(`/api/appointments/${id}/complete-payment`);
      router.refresh();
    } catch { alert("Error al completar pago"); }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar el turno definitivamente?")) return;
    try {
      await axios.delete(`/api/appointments/${id}`);
      router.push("/admin");
    } catch { alert("No se pudo eliminar"); }
  }

  async function handleQuickStatus(newStatus: string) {
    try {
      const payload: any = {
        name: name.trim(), lastName: lastName.trim(),
        telefono: telefono.trim() || null, instagram: instagram.trim() || null,
        notes: notes.trim() || null, serviceId, status: newStatus,
      };
      if (date && time) payload.date = new Date(`${date}T${time}`);
      await axios.put(`/api/appointments/${id}`, payload);
      setStatus(newStatus);
    } catch { alert("Error al actualizar estado"); }
  }

  function handleSendWhatsapp() {
    if (!telefono) return;
    const d = appointment.date ? new Date(appointment.date) : null;
    const fechaHora = d ? format(d, "dd/MM/yyyy HH:mm", { locale: es }) : "—";
    const msg = `Hola ${name} ${lastName}! 👋✨\n\nTu turno está confirmado 💄\n\n🧾 Servicio: ${appointment.service?.name ?? "—"}\n📅 Fecha y hora: ${fechaHora}\n\n¡Te esperamos! 💕`;
    const phone = telefono.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  async function handleSendInstagram() {
    if (!instagram) return;
    const username = instagram.replace("@", "");
    const d = appointment.date ? new Date(appointment.date) : null;
    const fechaHora = d ? format(d, "dd/MM/yyyy HH:mm", { locale: es }) : "—";
    const msg = `Hola ${name}! 💕✨\n\nTu turno está confirmado 💄\n\n🧾 Servicio: ${appointment.service?.name ?? "—"}\n📅 Fecha y hora: ${fechaHora}\n\n¡Te esperamos! 💖`;
    try { await navigator.clipboard.writeText(msg); } catch { /* clipboard no disponible */ }
    window.open(`https://www.instagram.com/${username}/`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Back */}
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 -ml-1"
      >
        <ChevronLeft size={16} />
        Turnos
      </button>

      <h1 className="text-lg font-semibold mb-5">Editar turno</h1>

      <div className="space-y-4">
        {/* DATOS PERSONALES */}
        <section className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cliente</p>
          <Field icon={<User size={15} />} label="Nombre">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field icon={<User size={15} />} label="Apellido">
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" />
          </Field>
          <Field icon={<Phone size={15} />} label="Teléfono">
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="input" />
          </Field>
          <Field icon={<Instagram size={15} />} label="Instagram">
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input" />
          </Field>
          <Field icon={<FileText size={15} />} label="Notas">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={2} />
          </Field>
        </section>

        {/* TURNO */}
        <section className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Turno</p>
          <Field icon={<Sparkles size={15} />} label="Servicio">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input">
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field icon={<CalendarClock size={15} />} label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>
          <Field icon={<CalendarClock size={15} />} label="Hora">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" />
          </Field>
        </section>

        {/* ESTADO */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === "completed" ? "bg-gray-100 text-gray-600" :
              status === "cancelled" ? "bg-red-50 text-red-500" :
              status === "confirmed" ? "bg-green-50 text-green-600" :
              "bg-yellow-50 text-yellow-600"
            }`}>
              {status === "completed" ? "Realizado" :
               status === "cancelled" ? "Cancelado" :
               status === "confirmed" ? "Confirmado" : "Pendiente"}
            </span>
          </div>
          {(status === "confirmed" || status === "pending") && (
            <button
              onClick={() => handleQuickStatus("completed")}
              className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-medium active:opacity-80 transition"
            >
              Realizado ✓
            </button>
          )}
        </section>

        {/* CONFIRMAR */}
        {(telefono || instagram) && (
          <section className="bg-white rounded-2xl p-4 space-y-2.5 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Enviar confirmación</p>
            {telefono && (
              <button
                onClick={handleSendWhatsapp}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium active:opacity-80 transition"
              >
                <MessageCircle size={15} />
                Confirmar por WhatsApp
              </button>
            )}
            {instagram && (
              <button
                onClick={handleSendInstagram}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-medium active:opacity-80 transition"
              >
                <Instagram size={15} />
                Copiar mensaje · Instagram
              </button>
            )}
          </section>
        )}

        {/* PAGOS */}
        <section className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pagos</p>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total servicio</span>
            <div className="flex items-center gap-2">
              {precioCambio && (
                <span className="text-gray-300 line-through text-xs">${precioOriginal}</span>
              )}
              <span className="font-medium">${totalServicio}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pagado</span>
            <span className="font-medium text-green-600">${totalPagado}</span>
          </div>
          {restante > 0 && (
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-500">Restante</span>
              <span className="font-semibold text-red-500">${restante}</span>
            </div>
          )}
          {restante === 0 && totalServicio > 0 && (
            <p className="text-sm text-green-600 font-medium text-center">Pago completo ✓</p>
          )}

          <Field icon={<BadgeCheck size={15} />} label="Agregar seña">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="input"
              placeholder="Monto"
            />
          </Field>

          <button onClick={handleAddDeposit} className="w-full bg-gray-100 text-gray-800 py-2.5 rounded-xl text-sm font-medium">
            Registrar seña
          </button>

          {restante > 0 && (
            <button onClick={handleCompletePayment} className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium">
              Marcar pago completo
            </button>
          )}
        </section>

        {/* ACCIONES */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 flex-1 text-sm"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white flex-1 text-sm font-medium"
          >
            <Save size={15} />
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
      <label className="flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
