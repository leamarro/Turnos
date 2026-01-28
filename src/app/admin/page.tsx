"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Pencil,
  Trash2,
  CalendarDays,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  name: string;
  lastName: string;
  telefono: string;
  status: string;
  date: string;
  service?: { name?: string };
};

/* ================= ESTADOS ================= */

const STATUS_MAP: Record<string, string> = {
  pending: "pendiente",
  confirmed: "confirmado",
  cancelled: "cancelado",
  finalized: "finalizado",

  pendiente: "pendiente",
  confirmado: "confirmado",
  cancelado: "cancelado",
  finalizado: "finalizado",
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
};

const STATUS_STYLE: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  finalizado: "bg-gray-200 text-gray-700",
};

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const router = useRouter();

  /* ================= FETCH ================= */

  async function fetchAppointments(date?: string) {
    setIsFiltering(true);

    const res = await axios.get(
      `/api/appointments${date ? `?date=${date}` : ""}`
    );

    const normalized = Array.isArray(res.data)
      ? res.data
          .map((a: Appointment) => ({
            ...a,
            status: STATUS_MAP[a.status] ?? a.status,
          }))
          .sort(
            (a, b) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          )
      : [];

    setAppointments(normalized);

    // ✨ micro feedback
    setTimeout(() => setIsFiltering(false), 200);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ================= ACTIONS ================= */

  async function updateStatus(id: string, status: string) {
    await axios.put(`/api/appointments?id=${id}`, { status });
    fetchAppointments(filterDate);
  }

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments(filterDate);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* ================= FILTRO ================= */}
      <div
        className={`bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between transition-all duration-200 ${
          isFiltering ? "opacity-70 scale-[0.99]" : ""
        }`}
      >
        {/* DATE */}
        <div className="flex flex-col gap-1 max-w-xs">
          <label className="text-xs text-gray-500">
            Filtrar por fecha
          </label>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="minimal-input"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => fetchAppointments(filterDate)}
            className="bg-black text-white px-4 py-2 rounded-xl active:scale-95 transition"
          >
            Filtrar
          </button>

          <button
            onClick={() => {
              setFilterDate("");
              fetchAppointments();
            }}
            className="px-4 py-2 rounded-xl border active:scale-95 transition"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="sm:hidden space-y-4">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-4 shadow space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <User size={16} />
                  {a.name} {a.lastName}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} />
                  {a.telefono}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLE[a.status]}`}
              >
                {STATUS_LABEL[a.status]}
              </span>
            </div>

            <p className="text-sm">{a.service?.name}</p>

            <div className="text-sm text-gray-600 flex flex-col">
              <span className="flex items-center gap-2">
                <CalendarDays size={14} />
                {format(new Date(a.date), "dd/MM/yyyy", {
                  locale: es,
                })}
              </span>
              <span className="text-xs text-gray-500 ml-6">
                {format(new Date(a.date), "HH:mm")} hs
              </span>
            </div>

            <select
              value={a.status}
              onChange={(e) =>
                updateStatus(a.id, e.target.value)
              }
              className="minimal-input"
            >
              {Object.keys(STATUS_LABEL).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => router.push(`/admin/edit/${a.id}`)}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => deleteAppointment(a.id)}
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden sm:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Servicio</th>
              <th className="p-3 text-left">Fecha / Hora</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  {a.name} {a.lastName}
                </td>
                <td className="p-3">{a.telefono}</td>
                <td className="p-3">{a.service?.name}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span>
                      {format(new Date(a.date), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(a.date), "HH:mm")} hs
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <select
                    value={a.status}
                    onChange={(e) =>
                      updateStatus(a.id, e.target.value)
                    }
                    className="minimal-input"
                  >
                    {Object.keys(STATUS_LABEL).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() =>
                        router.push(`/admin/edit/${a.id}`)
                      }
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteAppointment(a.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="text-center p-6 text-gray-500">
            No hay turnos cargados.
          </p>
        )}
      </div>
    </div>
  );
}
