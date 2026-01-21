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
} from "lucide-react";

type Appointment = {
  id: string;
  name: string;
  lastName?: string;
  telefono: string;
  date: string;
  status: string;
  service?: {
    name: string;
  };
};

/* 🧠 Traducción de estados */
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

  const statusColor =
    appointment.status === "confirmed" || appointment.status === "confirmado"
      ? "text-green-600"
      : appointment.status === "cancelled" || appointment.status === "cancelado"
      ? "text-red-600"
      : appointment.status === "finished" || appointment.status === "finalizado"
      ? "text-gray-600"
      : "text-yellow-600";

  const isConfirmed =
    appointment.status.toLowerCase() === "confirmed" ||
    appointment.status.toLowerCase() === "confirmado";
  
    const isPending =
    appointment.status.toLowerCase() === "pending" ||
    appointment.status.toLowerCase() === "pendiente";

  const handleSendWhatsapp = () => {
    const message = `Hola ${appointment.name} ${
      appointment.lastName ?? ""
    }! \n\nTu turno ha sido confirmado.\n\nServicio: ${
      appointment.service?.name ?? "—"
    }\nFecha y hora: ${format(
      new Date(appointment.date),
      "dd/MM/yyyy HH:mm",
      { locale: es }
    )}\n\n¡Nos vemos pronto!`;
    const phone = appointment.telefono.replace(/\D/g, ""); // limpia símbolos
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
            {appointment.telefono}
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

        {/* WhatsApp */}
        {isConfirmed || isPending && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSendWhatsapp}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
            >
              <MessageCircle size={18} />
              Enviar WhatsApp
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-center">
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
