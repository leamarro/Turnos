"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
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
  name?: string;
  lastName?: string;
  telefono?: string;
  status?: string;
  date: string;
  service?: { name?: string };
};

/* ========================= */
/* ⏱️ TIEMPO RELATIVO */
/* ========================= */
function getTimeState(date: string) {
  const diff = new Date(date).getTime() - Date.now();

  if (diff < 0) return "past";
  if (diff < 1000 * 60 * 60) return "soon"; // < 1h
  return "future";
}

const TIME_STYLE: Record<string, string> = {
  past: "opacity-50 bg-gray-50",
  soon: "bg-green-100 border-l-4 border-green-500",
  future: "bg-white",
};

/* ========================= */
/* 📅 FILTRO FRONTEND */
/* ========================= */
function filterByDate(list: Appointment[], date?: string) {
  if (!date) return list;

  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);

  return list.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getFullYear() === selected.getFullYear() &&
      d.getMonth() === selected.getMonth() &&
      d.getDate() === selected.getDate()
    );
  });
}

export default function AdminPanel() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ========================= */
  /* FETCH */
  /* ========================= */
  async function fetchAppointments() {
    const res = await axios.get("/api/appointments");

    const normalized = Array.isArray(res.data)
      ? res.data.sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
      : [];

    setAllAppointments(normalized);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ========================= */
  /* FILTRADO + ORDEN */
  /* ========================= */
  const appointments = useMemo(() => {
    const filtered = filterByDate(allAppointments, filterDate);

    return filtered.sort((a, b) => {
      const ta = getTimeState(a.date);
      const tb = getTimeState(b.date);

      if (ta === "past" && tb !== "past") return 1;
      if (ta !== "past" && tb === "past") return -1;

      return (
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
      );
    });
  }, [allAppointments, filterDate]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* FILTRO */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setLoading(true);
              setFilterDate(e.target.value);
              setTimeout(() => setLoading(false), 250);
            }}
            className="minimal-input max-w-xs"
          />
          {!filterDate && (
            <span className="absolute left-3 top-2.5 text-xs text-gray-400 pointer-events-none sm:hidden">
              Filtrar por fecha
            </span>
          )}
        </div>

        <button
          onClick={() => setFilterDate("")}
          className="text-sm underline text-gray-600"
        >
          Limpiar
        </button>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className={`sm:hidden space-y-4 transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {appointments.map((a) => {
          const timeState = getTimeState(a.date);

          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 shadow transition ${TIME_STYLE[timeState]}`}
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

              <div className="text-sm text-gray-600 mt-2 flex flex-col">
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
          );
        })}

        {appointments.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No hay turnos para esta fecha
          </p>
        )}
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
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr
                key={a.id}
                className={`border-t ${
                  getTimeState(a.date) === "past"
                    ? "opacity-50"
                    : ""
                }`}
              >
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
            No hay turnos para esta fecha
          </p>
        )}
      </div>
    </div>
  );
}
