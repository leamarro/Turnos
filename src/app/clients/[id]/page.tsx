"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DollarSign, Calendar, Sparkles, Trash2 } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  service: {
    name: string;
  };
};

type Client = {
  id: string;
  name: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  totalSpent: number;
  totalAppointments: number;
  topServices: { name: string; count: number }[];
  lastAppointment: string | null;
  appointments: Appointment[];
};

export default function ClientDetail({
  params,
}: {
  params: { id: string };
}) {
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/clients/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error");
        }
        return res.json();
      })
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  async function handleDelete() {
    if (!confirm(`¿Borrar a ${client?.name} ${client?.lastName ?? ""} y todos sus turnos?`)) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/clients/${params.id}`);
      toast("Cliente eliminado", "success");
      router.push("/clients");
    } catch {
      toast("Error al borrar el cliente", "error");
      setDeleting(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Cargando...</p>;

  if (error) {
    return (
      <p className="p-6 text-red-600">
        {error}
      </p>
    );
  }

  if (!client) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">
        {client.name} {client.lastName ?? ""}
      </h1>

      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {client.telefono
          ? `📞 ${client.telefono}`
          : client.instagram
          ? `📸 ${client.instagram}`
          : "Sin contacto"}
      </p>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
          <DollarSign size={16} className="text-green-500 mb-1" />
          <p className="text-lg font-bold">${client.totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Gastado</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
          <Calendar size={16} className="text-blue-500 mb-1" />
          <p className="text-lg font-bold">{client.totalAppointments}</p>
          <p className="text-xs text-gray-400">Turnos</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 col-span-2">
          <Sparkles size={16} className="text-purple-500 mb-1" />
          <p className="text-sm font-medium truncate">
            {client.topServices[0]?.name || "—"}
          </p>
          <p className="text-xs text-gray-400">
            {client.topServices[0]
              ? `${client.topServices[0].count} turnos · más frecuente`
              : "Sin servicios"}
          </p>
        </div>
      </div>

      {/* TOP SERVICES */}
      {client.topServices.length > 1 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Servicios más frecuentes
          </h3>
          <div className="space-y-1.5">
            {client.topServices.map((s, i) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-sm bg-white dark:bg-[#1a1a1a] rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-800"
              >
                <span>
                  {i + 1}. {s.name}
                </span>
                <span className="text-gray-400">{s.count} turno{s.count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Historial de turnos</h2>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-full disabled:opacity-50"
        >
          <Trash2 size={12} />
          {deleting ? "Borrando..." : "Borrar cliente"}
        </button>
      </div>

      {client.appointments.length === 0 ? (
        <p className="text-gray-500">
          Este cliente no tiene turnos.
        </p>
      ) : (
        <div className="space-y-3">
          {client.appointments.map((a) => (
            <div
              key={a.id}
              className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-[#1a1a1a] shadow-sm"
            >
              <p className="font-medium">
                {a.service?.name || "Sin servicio"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(a.date), "d MMM yyyy, HH:mm", { locale: es })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {a.status === "completed" ? "Realizado" :
                 a.status === "cancelled" ? "Cancelado" :
                 a.status === "confirmed" ? "Confirmado" : "Pendiente"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
