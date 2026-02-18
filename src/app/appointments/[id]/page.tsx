"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  User,
  Phone,
  Sparkles,
  CalendarClock,
  BadgeCheck,
  Pencil,
  MessageCircle,
  Instagram,
} from "lucide-react";

type Appointment = {
  id: string;
  name: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  date: string;
  status: string;
  service?: {
    name: string;
  };
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelado: "Cancelado",
  finished: "Finalizado",
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  finalizado: "Finalizado",
};

export default function AppointmentDetail({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetch(`/api/appointments?id=${params.id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setAppointment)
      .catch(() => setAppointment(null));
  }, [params.id]);

  if (!appointment) {
    return (
      <p className="p-6 text-center text-gray-500">
        Cargando turno…
      </p>
    );
  }

  const statusLower = appointment.status.toLowerCase();

  const statusColor =
    statusLower === "confirmed" || statusLower === "confirmado"
      ? "text-green-600"
      : statusLower === "cancelled" || statusLower === "cancelado"
      ? "text-red-600"
      : statusLower === "finished" || statusLower === "finalizado"
      ? "text-gray-600"
      : "text-yellow-600";

  const isConfirmed =
    statusLower === "confirmed" || statusLower === "confirmado";

  const isPending =
    statusLower === "pending" || statusLower === "pendiente";

  /* ========================= */
  /* 📲 WHATSAPP */
  /* ========================= */
  const handleSendWhatsapp = () => {
    if (!appointment.telefono) return;

    const message = `Hola ${appointment.name} ${
      appointment.lastName ?? ""
    }! 👋✨

Tu turno está confirmado 💄

🧾 Servicio: ${appointment.service?.name ?? "—"}
📅 Fecha y hora: ${format(
      new Date(appointment.date),
      "dd/MM/yyyy HH:mm",
      { locale: es }
    )}

¡Te esperamos! 💕`;

    const phone = appointment.telefono.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ========================= */
  /* 📸 INSTAGRAM */
  /* ========================= */
  const handleSendInstagram = async () => {
    if (!appointment.instagram) return;

    const username = appointment.instagram.replace("@", "");

    const message = `Hola ${appointment.name}! 💕✨

Tu turno está confirmado 💄

🧾 Servicio: ${appointment.service?.name ?? "—"}
📅 Fecha y hora: ${format(
      new Date(appointment.date),
      "dd/MM/yyyy HH:mm",
      { locale: es }
    )}

¡Te esperamos! 💖`;

    try {
      await navigator.clipboard.writeText(message);
      alert("Mensaje copiado 📋 Pegalo en el DM de Instagram");
    } catch (err) {
      console.warn("No se pudo copiar el mensaje");
    }

    window.open(
      `https://www.instagram.com/${username}/`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 sm:pt-16 pb-16">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 relative">

        {/* ✏️ EDITAR */}
        <button
          onClick={() => router.push(`/admin/edit/${params.id}`)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Editar turno"
        >
          <Pencil size={18} />
        </button>

        <h1 className="text-xl font-semibold text-center mb-6">
          Detalle del turno
        </h1>

        <div className="space-y-4 text-sm">

          <Info label="Cliente" icon={<User size={16} />}>
            {appointment.name} {appointment.lastName ?? ""}
          </Info>

          <Info label="Teléfono" icon={<Phone size={16} />}>
            {appointment.telefono ?? "—"}
          </Info>

          <Info label="Instagram" icon={<Instagram size={16} />}>
            {appointment.instagram ?? "—"}
          </Info>

          <Info label="Servicio" icon={<Sparkles size={16} />}>
            {appointment.service?.name ?? "—"}
          </Info>

          <Info label="Fecha y hora" icon={<CalendarClock size={16} />}>
            {format(new Date(appointment.date), "dd/MM/yyyy HH:mm", {
              locale: es,
            })} hs
          </Info>

          <Info label="Estado" icon={<BadgeCheck size={16} />}>
            <span className={`font-medium ${statusColor}`}>
              {STATUS_LABELS[appointment.status] ?? appointment.status}
            </span>
          </Info>

        </div>

        {(isConfirmed || isPending) && (
          <div className="mt-6 flex flex-col gap-3">

            {appointment.telefono && (
              <button
                onClick={handleSendWhatsapp}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
              >
                <MessageCircle size={18} />
                Enviar WhatsApp
              </button>
            )}

            {appointment.instagram && (
              <button
                onClick={handleSendInstagram}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
              >
                <Instagram size={18} />
                Enviar DM Instagram
              </button>
            )}

          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 border rounded-xl text-sm hover:bg-gray-100 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= */
/* ℹ️ INFO ROW */
/* ========================= */
function Info({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 gap-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <span className="text-right">
        {children}
      </span>
    </div>
  );
}
