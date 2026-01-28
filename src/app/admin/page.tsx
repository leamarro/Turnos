"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
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

  if (diffMin < 0) return { state: "past", label: "Ya pasó" };
  if (diffMin <= 60) return { state: "very-soon", label: "Empieza pronto" };
  if (diffMin <= 240) return { state: "soon", label: "En el día" };
  return { state: "future", label: "Próximo" };
}

function getCardStyle(state: string) {
  switch (state) {
    case "very-soon":
      return "bg-green-200 border-l-4 border-green-600";
    case "soon":
      return "bg-green-100 border-l-4 border-green-400";
    case "past":
      return "bg-gray-50 opacity-40";
    default:
      return "bg-white";
  }
}

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [quickFilter, setQuickFilter] =
    useState<"all" | "today" | "tomorrow" | "week">("all");
  const [showPast, setShowPast] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* ================= FETCH ================= */

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

  /* ================= FILTER LOGIC ================= */

  const appointments = useMemo(() => {
    let list = [...allAppointments];

    // ⛔ ocultar pasados
    if (!showPast) {
      list = list.filter(
        (a) => new Date(a.date).getTime() >= Date.now()
      );
    }

    // 📅 filtro input date
    if (filterDate) {
      const selected = new Date(`${filterDate}T00:00:00`);
      list = list.filter(
        (a) =>
          format(new Date(a.date), "yyyy-MM-dd") ===
          format(selected, "yyyy-MM-dd")
      );
    }

    // ⚡ filtros rápidos
    list = list.filter((a) => {
      const d = new Date(a.date);
      if (quickFilter === "today") return isToday(d);
      if (quickFilter === "tomorrow") return isTomorrow(d);
      if (quickFilter === "week") return isThisWeek(d, { weekStartsOn: 1 });
      return true;
    });

    return list;
  }, [allAppointments, filterDate, quickFilter, showPast]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-28">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-2xl p-4 mb-6 space-y-3">
        {/* QUICK FILTERS */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            ["all", "Todos"],
            ["today", "Hoy"],
            ["tomorrow", "Mañana"],
            ["week", "Semana"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setLoading(true);
                setQuickFilter(k as any);
                setTimeout(() => setLoading(false), 200);
              }}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                quickFilter === k
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* DATE + TOGGLE */}
        <div className="flex justify-between items-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setLoading(true);
              setFilterDate(e.target.value);
              setTimeout(() => setLoading(false), 200);
            }}
            className="minimal-input max-w-xs"
          />

          <button
            onClick={() => setShowPast((v) => !v)}
            className="text-xs text-gray-600 flex items-center gap-1 transition hover:scale-105"
          >
            {showPast ? "Ocultar pasados" : "Mostrar pasados"}
          </button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className={`sm:hidden space-y-4 transition-all duration-300 ${
          loading ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
        }`}
      >
        {appointments.map((a) => {
          const info = getTimeInfo(a.date);

          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 shadow transition-all duration-300 ${getCardStyle(
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
                <p className="text-xs text-gray-500 ml-6">
                  {format(new Date(a.date), "HH:mm")} hs · {info.label}
                </p>
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
