"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  format,
  isToday,
  differenceInMinutes,
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
  name?: string;
  lastName?: string;
  telefono?: string;
  date: string;
  service?: { name?: string };
};

/* ================= HAPTIC ================= */

function vibrate(ms = 20) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

/* ================= TIME ================= */

function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diff = differenceInMinutes(d, now);

  if (diff < -10) return { state: "past" };
  if (diff >= -10 && diff <= 10)
    return { state: "focus" }; // 🔥 turno actual
  if (diff <= 60) return { state: "very-soon" };
  if (diff <= 240) return { state: "soon" };
  return { state: "future" };
}

function cardStyle(state: string) {
  if (state === "focus")
    return "bg-green-300 ring-4 ring-green-500 scale-[1.02]";
  if (state === "very-soon")
    return "bg-green-200 border-l-4 border-green-600";
  if (state === "soon")
    return "bg-green-100 border-l-4 border-green-400";
  if (state === "past") return "bg-gray-50 opacity-40";
  return "bg-white";
}

/* ================= COMPONENT ================= */

export default function AdminPanel() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(
    null
  );

  const router = useRouter();

  async function fetchAppointments() {
    const res = await axios.get("/api/appointments");
    setItems(res.data ?? []);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* 🔁 reorden dinámico */
  useEffect(() => {
    const i = setInterval(() => {
      setItems((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(i);
  }, []);

  const ordered = useMemo(() => {
    const list = [...items].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    const focus = list.find(
      (a) => getTimeInfo(a.date).state === "focus"
    );
    if (focus && !focusedId) setFocusedId(focus.id);

    return list;
  }, [items]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ================= SWIPE + DRAG CARD ================= */

  function Card({ a, index }: { a: Appointment; index: number }) {
    const startX = useRef(0);
    const startY = useRef(0);
    const dragging = useRef(false);

    const [offset, setOffset] = useState(0);
    const [snap, setSnap] = useState(false);

    const info = getTimeInfo(a.date);
    const isFocus = info.state === "focus";

    function onTouchStart(e: React.TouchEvent) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: React.TouchEvent) {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (Math.abs(dy) > 12) return;

      setOffset(dx * 0.7); // 🧲 elastic
    }

    function onTouchEnd() {
      if (offset > 80) {
        setSnap(true);
        setOffset(70);
        vibrate(15);
        return;
      }

      if (offset < -120) {
        vibrate(20);
        deleteAppointment(a.id);
        return;
      }

      setOffset(0);
      setSnap(false);
    }

    /* ================= DRAG ================= */

    function onLongPress() {
      dragging.current = true;
      vibrate(30);
    }

    function onDragOver(e: React.DragEvent) {
      e.preventDefault();
      if (!dragging.current) return;

      setItems((prev) => {
        const arr = [...prev];
        const dragged = arr.splice(index, 1)[0];
        arr.splice(index, 0, dragged);
        return arr;
      });
    }

    return (
      <div
        draggable
        onDragStart={onLongPress}
        onDragOver={onDragOver}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* ACTIONS */}
        <div className="absolute inset-0 flex justify-end items-center pr-4 gap-3">
          <button
            onClick={() =>
              router.push(`/admin/edit/${a.id}`)
            }
            className="bg-blue-500 text-white px-3 py-2 rounded-full"
          >
            Editar
          </button>
          <button
            onClick={() => deleteAppointment(a.id)}
            className="bg-red-500 text-white px-3 py-2 rounded-full"
          >
            Eliminar
          </button>
        </div>

        {/* CARD */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translateX(${offset}px)`,
          }}
          className={`relative z-10 p-4 rounded-2xl shadow transition-all duration-300 ${cardStyle(
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
              {format(new Date(a.date), "HH:mm")} hs
            </p>
          </div>

          {isFocus && (
            <p className="mt-2 text-xs font-semibold text-green-800">
              🔥 Turno actual
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 pb-28">
      <h1 className="text-2xl font-semibold text-center my-6">
        Turnos
      </h1>

      <div className="sm:hidden space-y-4">
        {ordered.map((a, i) => (
          <Card key={a.id} a={a} index={i} />
        ))}

        {ordered.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No hay turnos
          </p>
        )}
      </div>
    </div>
  );
}
