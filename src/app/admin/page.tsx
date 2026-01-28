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
  date: string;
  service?: { name?: string };
};

/* ========================= */
/* 🕒 ESTADO TEMPORAL */
/* ========================= */
function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffMin = diffMs / 1000 / 60;

  if (diffMs < 0) return { state: "past", diffMin };
  if (diffMin <= 60) return { state: "very-soon", diffMin };
  if (diffMin <= 240) return { state: "soon", diffMin };
  return { state: "future", diffMin };
}

function getCardStyle(state: string) {
  switch (state) {
    case "very-soon":
      return "bg-green-200 border-l-4 border-green-600";
    case "soon":
      return "bg-green-100 border-l-4 border-green-400";
    case "future":
      return "bg-white";
    case "past":
      return "bg-gray-50 opacity-50";
    default:
      return "bg-white";
  }
}

/* ========================= */
/* 📅 COMPARAR MISMO DÍA */
/* ========================= */
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

    const ordered = Array.isArray(res.data)
      ? res.data.sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
      : [];

    setAllAppointments(ordered);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ========================= */
  /* FILTRO FRONTEND REAL */
  /* ========================= */
  const appointments = useMemo(() => {
    let list = [...allAppointments];

    if (filterDate) {
      const [y, m, d] = filterDate.split("-").map(Number);
      const selected = new Date(y, m - 1, d);

      list = list.filter((a) =>
        isSameDay(new Date(a.date), selected)
      );
    }

    // futuros primero, pasados al final
    return list.sort((a, b) => {
      const ta = getTimeInfo(a.date).state;
      const tb = getTimeInfo(b.date).state;

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
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col gap-3">
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setLoading(true);
              setFilterDate(e.target.value);
              setTimeout(() => setLoading(false), 200);
            }}
            className="minimal-input w-full"
          />
          {!filterDate && (
            <span className="absolute left-3 top-2.5 text-xs text-gray-400 pointer-events-none sm:hidden">
              Filtrar por fecha
            </span>
          )}
        </div>

        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="text-xs text-gray-600 underline self-end"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* MOBILE */}
      <div
        className={`sm:hidden space-y-4 transition-opacity ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {appointments.map((a) => {
          const info = getTimeInfo(a.date);

          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 shadow ${getCardStyle(
                info.state
              )}`}
            >
              <p className="font-semibold flex items-center gap-2">
                <User size={16} />
                {a.name} {a.lastName}
              </p>

              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Phone size={14} />
                {a.telefono}
              </p>

              <p className="text-sm mt-2">
                {a.service?.name}
              </p>

              <div className="text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {format(new Date(a.date), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  {format(new Date(a.date), "HH:mm")} hs
                </div>
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
    </div>
  );
}
