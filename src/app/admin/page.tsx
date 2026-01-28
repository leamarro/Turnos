"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  format,
  differenceInMinutes,
  isPast,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Pencil,
  Trash2,
  CalendarDays,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Appointment = {
  id: string;
  name?: string | null;
  lastName?: string | null;
  telefono?: string | null;
  date: string;
  service?: { name?: string | null };
};

/* ================= HELPERS ================= */

function getBorderStyle(date: string) {
  const mins = differenceInMinutes(new Date(date), new Date());

  if (mins < 0) return "border-l-4 border-gray-300 opacity-40";
  if (mins < 30) return "border-l-4 border-green-600";
  if (mins < 120) return "border-l-4 border-green-400";
  return "border-l-4 border-gray-200";
}

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ================= FETCH ================= */

  async function fetchAppointments(date?: string) {
    setLoading(true);

    let url = "/api/appointments";

    if (date) {
      const from = `${date}T00:00:00`;
      const to = `${date}T23:59:59`;
      url += `?from=${from}&to=${to}`;
    }

    const res = await axios.get(url);

    const sorted = Array.isArray(res.data)
      ? res.data
          .filter((a: Appointment) => !isPast(new Date(a.date)))
          .sort(
            (a: Appointment, b: Appointment) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          )
      : [];

    setAppointments(sorted);
    setLoading(false);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments(filterDate);
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* FILTRO */}
      <div className="bg-white rounded-2xl p-4 mb-6 space-y-3">
        <label className="text-xs text-gray-500">
          Filtrar por fecha
        </label>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="minimal-input"
        />

        <div className="flex gap-3">
          <button
            onClick={() => fetchAppointments(filterDate)}
            className="bg-black text-white px-4 py-2 rounded-xl transition active:scale-95"
          >
            Filtrar
          </button>

          <button
            onClick={() => {
              setFilterDate("");
              fetchAppointments();
            }}
            className="px-4 py-2 rounded-xl border"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className={`sm:hidden space-y-4 transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {appointments.map((a) => (
          <div
            key={a.id}
            className={`bg-white rounded-2xl p-4 shadow ${getBorderStyle(
              a.date
            )}`}
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
            </div>

            <p className="text-sm mt-2">
              {a.service?.name}
            </p>

            <div className="text-sm text-gray-600 mt-2">
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

            <div className="flex justify-end gap-4 pt-3">
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
          </div>
        ))}

        {appointments.length === 0 && !loading && (
          <p className="text-center text-gray-500 text-sm">
            No hay turnos para esta fecha
          </p>
        )}
      </div>
    </div>
  );
}
