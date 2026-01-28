"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
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

/* ================= TIME HELPERS ================= */

function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMin = (d.getTime() - now.getTime()) / 60000;

  if (diffMin < 0) return { state: "past", diffMin };
  if (diffMin <= 30) return { state: "very-soon", diffMin };
  if (diffMin <= 180) return { state: "soon", diffMin };
  return { state: "future", diffMin };
}

function cardStyle(state: string) {
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

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [appointmentsRaw, setAppointmentsRaw] = useState<Appointment[]>([]);
  const [rangeFilter, setRangeFilter] = useState<
    "all" | "today" | "tomorrow" | "week"
  >("all");
  const [showPast, setShowPast] = useState(true);

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

    setAppointmentsRaw(ordered);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ============ FILTER LOGIC ============ */

  const appointments = useMemo(() => {
    const now = new Date();

    let list = [...appointmentsRaw];

    // ⏳ rango
    if (rangeFilter !== "all") {
      let from: Date;
      let to: Date;

      if (rangeFilter === "today") {
        from = startOfDay(now);
        to = endOfDay(now);
      } else if (rangeFilter === "tomorrow") {
        from = startOfDay(addDays(now, 1));
        to = endOfDay(addDays(now, 1));
      } else {
        from = startOfDay(now);
        to = endOfDay(addDays(now, 7));
      }

      list = list.filter((a) => {
        const d = new Date(a.date);
        return d >= from && d <= to;
      });
    }

    // ⛔ ocultar pasados
    if (!showPast) {
      list = list.filter(
        (a) => new Date(a.date).getTime() >= now.getTime()
      );
    }

    // 🔀 futuros primero
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
  }, [appointmentsRaw, rangeFilter, showPast]);

  /* ============ DELETE ============ */

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-4">
        Turnos
      </h1>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            ["all", "Todos"],
            ["today", "Hoy"],
            ["tomorrow", "Mañana"],
            ["week", "Semana"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setRangeFilter(key as any)
              }
              className={`px-3 py-1 rounded-full text-sm transition ${
                rangeFilter === key
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPast((p) => !p)}
          className="text-sm underline"
        >
          {showPast
            ? "Ocultar pasados"
            : "Mostrar pasados"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {appointments.map((a) => {
          const info = getTimeInfo(a.date);
          const isFocus = info.state === "very-soon";

          return (
            <div
              key={a.id}
              className={`relative rounded-2xl p-4 shadow transition ${cardStyle(
                info.state
              )}`}
            >
              {isFocus && (
                <span className="absolute -top-2 right-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">
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

              <div className="text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {format(new Date(a.date), "dd/MM/yyyy", {
                    locale: es,
                  })}{" "}
                  – {format(new Date(a.date), "HH:mm")}
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
            No hay turnos para este filtro
          </p>
        )}
      </div>
    </div>
  );
}
