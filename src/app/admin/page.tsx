"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
/* ⏱️ ESTADO TEMPORAL REAL */
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
/* 📅 FILTRO POR DÍA (SAFE) */
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function AdminPanel() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterOption, setFilterOption] = useState<"all" | "today" | "tomorrow" | "week">("all");
  const [showPast, setShowPast] = useState(false);
  const router = useRouter();

  const today = new Date();

  /* ========================= */
  /* FETCH */
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
  /* FILTRADO + ORDEN */
  const appointments = useMemo(() => {
    let list = [...allAppointments];

    const todayStart = new Date(today); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);

    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const tomorrowStart = new Date(tomorrow); tomorrowStart.setHours(0,0,0,0);
    const tomorrowEnd = new Date(tomorrow); tomorrowEnd.setHours(23,59,59,999);

    const weekEnd = new Date(today); weekEnd.setDate(today.getDate()+7);

    if (filterOption === "today") {
      list = list.filter(a => {
        const d = new Date(a.date);
        return d >= todayStart && d <= todayEnd;
      });
    } else if (filterOption === "tomorrow") {
      list = list.filter(a => {
        const d = new Date(a.date);
        return d >= tomorrowStart && d <= tomorrowEnd;
      });
    } else if (filterOption === "week") {
      list = list.filter(a => {
        const d = new Date(a.date);
        return d >= todayStart && d <= weekEnd;
      });
    }

    if (filterDate) {
      const selected = new Date(`${filterDate}T00:00:00`);
      list = list.filter((a) => sameDay(new Date(a.date), selected));
    }

    if (!showPast) {
      list = list.filter(a => new Date(a.date) >= todayStart);
    }

    return list.sort((a, b) => {
      const ta = getTimeInfo(a.date).state;
      const tb = getTimeInfo(b.date).state;

      if (ta === "past" && tb !== "past") return 1;
      if (ta !== "past" && tb === "past") return -1;

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [allAppointments, filterDate, filterOption, showPast]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  /* ========================= */
  /* SWIPE LOGIC */
  const swipeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  function handleSwipeStart(e: React.TouchEvent, id: string) {
    const card = swipeRefs.current.get(id);
    if (!card) return;
    (card as any).startX = e.touches[0].clientX;
  }

  function handleSwipeMove(e: React.TouchEvent, id: string) {
    const card = swipeRefs.current.get(id);
    if (!card) return;
    const startX = (card as any).startX ?? 0;
    const dx = e.touches[0].clientX - startX;
    (card as any).dx = dx;

    const transform = Math.min(Math.max(dx, -100), 100);
    const content = card.querySelector(".card-content") as HTMLDivElement;
    if (content) content.style.transform = `translateX(${transform}px)`;
    if (content) content.style.transition = "transform 0s";

    // PINTAR FONDO COMPLETO
    const bg = card.querySelector(".card-bg") as HTMLDivElement;
    if (bg) {
      bg.style.opacity = `${Math.min(Math.abs(dx)/100, 1)}`;
    }
  }

  function handleSwipeEnd(e: React.TouchEvent, id: string) {
    const card = swipeRefs.current.get(id);
    if (!card) return;
    const dx = (card as any).dx ?? 0;

    if (dx < -60) {
      deleteAppointment(id);
      return;
    } else if (dx > 60) {
      router.push(`/admin/edit/${id}`);
      return;
    }

    const content = card.querySelector(".card-content") as HTMLDivElement;
    if (content) {
      content.style.transform = "translateX(0px)";
      content.style.transition = "transform 0.3s ease";
    }

    const bg = card.querySelector(".card-bg") as HTMLDivElement;
    if (bg) bg.style.opacity = "0";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["all","today","tomorrow","week"].map(opt => (
            <button
              key={opt}
              onClick={() => { setFilterOption(opt as any); setFilterDate(""); }}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filterOption===opt
                  ? "bg-black text-white"
                  : "border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {opt==="all"?"Todos":opt==="today"?"Hoy":opt==="tomorrow"?"Mañana":"Semana"}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center mt-2 sm:mt-0">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Filtrar por fecha</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="minimal-input max-w-xs"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="px-2 py-1 border rounded text-sm text-gray-600 hover:bg-gray-100"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowPast(v => !v)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              showPast ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {showPast ? "Ocultar pasados" : "Mostrar pasados"}
          </button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="sm:hidden space-y-4">
        {appointments.map((a) => {
          const info = getTimeInfo(a.date);
          const isNow = info.state === "very-soon" || info.state === "soon";

          return (
            <div
              key={a.id}
              ref={(el)=>{if(el) swipeRefs.current.set(a.id, el)}}
              className="relative rounded-2xl overflow-hidden h-full"
              onTouchStart={e=>handleSwipeStart(e,a.id)}
              onTouchMove={e=>handleSwipeMove(e,a.id)}
              onTouchEnd={e=>handleSwipeEnd(e,a.id)}
            >
              {/* FONDO COMPLETO */}
              <div className="card-bg absolute inset-0 flex justify-between items-center px-4 bg-white">
                <span className="text-green-600 font-bold">Editar</span>
                <span className="text-red-600 font-bold">Eliminar</span>
              </div>

              {/* TARJETA MOVIBLE */}
              <div className={`card-content relative p-4 rounded-2xl shadow transition ${getCardStyle(info.state)} ${isNow ? "ring-2 ring-green-400" : ""}`}>
                <p className="font-semibold flex items-center gap-2">
                  <User size={16} />
                  {a.name} {a.lastName}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} />
                  {a.telefono}
                </p>
                <p className="text-sm mt-2">{a.service?.name}</p>
                <div className="text-sm text-gray-600 mt-2 flex flex-col">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {format(new Date(a.date), "dd/MM/yyyy", { locale: es })}
                  </span>
                  <span className="text-xs text-gray-500 ml-6">
                    {format(new Date(a.date), "HH:mm")} hs
                  </span>
                </div>
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
            {appointments.map((a) => {
              const info = getTimeInfo(a.date);
              const isNow = info.state === "very-soon" || info.state === "soon";

              return (
                <tr key={a.id} className={`border-t transition ${isNow ? "bg-green-100" : ""}`}>
                  <td className="p-3">{a.name} {a.lastName}</td>
                  <td className="p-3">{a.telefono}</td>
                  <td className="p-3">{a.service?.name}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{format(new Date(a.date), "dd/MM/yyyy", { locale: es })}</span>
                      <span className="text-xs text-gray-500">{format(new Date(a.date), "HH:mm")} hs</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button onClick={()=>router.push(`/admin/edit/${a.id}`)} className="text-green-600"><Pencil size={18} /></button>
                      <button onClick={()=>deleteAppointment(a.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="text-center p-6 text-gray-500">No hay turnos para este filtro</p>
        )}
      </div>
    </div>
  );
}
