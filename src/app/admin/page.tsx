"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
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

/* ================= TIME ================= */

function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMin = (d.getTime() - now.getTime()) / 60000;

  if (diffMin < 0) return { state: "past", label: "Ya pasó" };
  if (diffMin <= 30) return { state: "very-soon", label: "En minutos" };
  if (diffMin <= 180) return { state: "soon", label: "Próximo" };
  return { state: "future", label: "Más adelante" };
}

function getCardStyle(state: string) {
  if (state === "very-soon")
    return "bg-green-300 border-l-4 border-green-700";
  if (state === "soon")
    return "bg-green-200 border-l-4 border-green-500";
  if (state === "past") return "bg-gray-50 opacity-40";
  return "bg-white";
}

/* ================= HAPTIC ================= */

function vibrate(ms = 20) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quickFilter, setQuickFilter] =
    useState<"all" | "today" | "tomorrow" | "week">("all");
  const [showPast, setShowPast] = useState(false);

  const router = useRouter();

  async function fetchAppointments() {
    const res = await axios.get("/api/appointments");
    setAppointments(res.data ?? []);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* 🔁 reorder every minute */
  useEffect(() => {
    const i = setInterval(() => {
      setAppointments((prev) =>
        [...prev].sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
      );
    }, 60000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    let list = [...appointments];

    if (!showPast) {
      list = list.filter(
        (a) => new Date(a.date).getTime() >= Date.now()
      );
    }

    list = list.filter((a) => {
      const d = new Date(a.date);
      if (quickFilter === "today") return isToday(d);
      if (quickFilter === "tomorrow") return isTomorrow(d);
      if (quickFilter === "week")
        return isThisWeek(d, { weekStartsOn: 1 });
      return true;
    });

    return list;
  }, [appointments, quickFilter, showPast]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ================= SWIPE CARD ================= */

  function SwipeCard({ a }: { a: Appointment }) {
    const startX = useRef(0);
    const startY = useRef(0);
    const pressTimer = useRef<any>(null);

    const [offset, setOffset] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    const THRESHOLD = 90;

    /* 🧲 Elastic resistance */
    function elastic(dx: number) {
      const limit = 120;
      if (Math.abs(dx) < limit) return dx;
      return limit + (dx - limit) * 0.25;
    }

    function onTouchStart(e: React.TouchEvent) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;

      pressTimer.current = setTimeout(() => {
        vibrate(25);
        setMenuOpen(true);
      }, 500);
    }

    function onTouchMove(e: React.TouchEvent) {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (Math.abs(dy) > 10) {
        clearTimeout(pressTimer.current);
        return;
      }

      clearTimeout(pressTimer.current);
      setOffset(elastic(dx));
    }

    function onTouchEnd() {
      clearTimeout(pressTimer.current);

      if (offset > THRESHOLD) {
        vibrate(20);
        router.push(`/admin/edit/${a.id}`);
      } else if (offset < -THRESHOLD) {
        vibrate(20);
        deleteAppointment(a.id);
      }

      setOffset(0);
    }

    const info = getTimeInfo(a.date);

    return (
      <>
        {/* LONG PRESS MENU */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="bg-white rounded-2xl p-4 w-64 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  router.push(`/admin/edit/${a.id}`)
                }
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100"
              >
                <Pencil size={18} /> Editar
              </button>

              <button
                onClick={() => deleteAppointment(a.id)}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} /> Eliminar
              </button>
            </div>
          </div>
        )}

        {/* SWIPE */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 flex justify-between items-center px-5 text-white text-sm">
            <div className="bg-blue-500 px-3 py-2 rounded-full">
              Editar
            </div>
            <div className="bg-red-500 px-3 py-2 rounded-full">
              Eliminar
            </div>
          </div>

          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ transform: `translateX(${offset}px)` }}
            className={`relative z-10 rounded-2xl p-4 shadow transition-transform duration-200 ${getCardStyle(
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

            <p className="text-sm mt-2">{a.service?.name}</p>

            <div className="text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} />
                {format(new Date(a.date), "dd/MM/yyyy", {
                  locale: es,
                })}
              </div>
              <p className="text-xs text-gray-500 ml-6">
                {format(new Date(a.date), "HH:mm")} hs ·{" "}
                {info.label}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pb-28">
      <h1 className="text-2xl font-semibold text-center my-6">
        Turnos
      </h1>

      <div className="bg-white rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex gap-2 overflow-x-auto">
          {[
            ["all", "Todos"],
            ["today", "Hoy"],
            ["tomorrow", "Mañana"],
            ["week", "Semana"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setQuickFilter(k as any)}
              className={`px-3 py-1 rounded-full text-sm ${
                quickFilter === k
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPast((v) => !v)}
          className="text-xs text-gray-600"
        >
          {showPast ? "Ocultar pasados" : "Mostrar pasados"}
        </button>
      </div>

      <div className="sm:hidden space-y-4">
        {filtered.map((a) => (
          <SwipeCard key={a.id} a={a} />
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No hay turnos
          </p>
        )}
      </div>
    </div>
  );
}
