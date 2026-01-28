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

/* ================= TYPES ================= */

type Appointment = {
  id: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  date: string;
  service?: { name?: string };
};

/* ================= TIME LOGIC ================= */

function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffMin = diffMs / 1000 / 60;

  if (diffMs < 0) return { state: "past", diffMin };
  if (diffMin <= 30) return { state: "very-soon", diffMin };
  if (diffMin <= 180) return { state: "soon", diffMin };
  return { state: "future", diffMin };
}

function getCardStyle(state: string) {
  switch (state) {
    case "very-soon":
      return "border-l-4 border-green-600 bg-green-50";
    case "soon":
      return "border-l-4 border-green-400 bg-green-50";
    case "past":
      return "opacity-50 bg-gray-50";
    default:
      return "bg-white";
  }
}

/* ================= DATE FILTER ================= */

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const router = useRouter();

  /* ============ FETCH ============ */

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

  /* ============ FILTER + ORDER ============ */

  const appointments = useMemo(() => {
    let list = [...allAppointments];

    // 📅 filtro frontend por fecha
    if (filterDate) {
      const selected = new Date(`${filterDate}T00:00:00`);
      list = list.filter((a) =>
        sameDay(new Date(a.date), selected)
      );
    }

    // ⏱️ futuros primero, pasados al final
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

  /* ============ DELETE ============ */

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* ================= FILTER ================= */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="minimal-input max-w-xs"
        />

        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="text-sm text-gray-600 underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ================= MOBILE ================= */}
      <div className="sm:hidden space-y-4">
        {appointments.map((a) => {
          const info = getTimeInfo(a.date);
          const isFocus = info.state === "very-soon";

          return (
            <div
              key={a.id}
              className={`relative rounded-2xl p-4 shadow transition ${getCardStyle(
                info.state
              )}`}
            >
              {isFocus && (
                <span className="absolute -top-2 right-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                  Turno actual
                </span>
              )}

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
    </div>
  );
}
