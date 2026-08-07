"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Phone, User, CalendarDays, X, MessageCircle, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/EmptyState";
import { haptic } from "@/lib/haptics";

/* ========================= */
/* TYPES */
type Payment = {
  id: string;
  amount: number;
  method: string;
};

type Appointment = {
  id: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  date: string;
  status?: string;
  servicePrice?: number | null;
  service?: { name?: string; price?: number };
  payments?: Payment[];
};

/* ========================= */
/* ⏱️ ESTADO TEMPORAL */
function getTimeInfo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffMin = diffMs / 1000 / 60;

  if (diffMs < 0) return { state: "past" };
  if (diffMin <= 60) return { state: "very-soon" };
  if (diffMin <= 240) return { state: "soon" };
  return { state: "future" };
}

function getCardStyle(state: string) {
  switch (state) {
    case "very-soon":
      return "bg-green-200 dark:bg-green-900/60 border-l-4 border-green-600";
    case "soon":
      return "bg-green-100 dark:bg-green-800/60 border-l-4 border-green-400";
    case "past":
      return "bg-gray-50 dark:bg-[#1f1f1f] opacity-50";
    default:
      return "bg-white dark:bg-[#252525]";
  }
}

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
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  async function fetchAppointments() {
    try {
      const res = await axios.get("/api/appointments");
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a: Appointment, b: Appointment) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setAllAppointments(list);
    } catch {
      setAllAppointments([]);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pendientes") === "1") setShowPendingOnly(true);
  }, []);

  const appointments = useMemo(() => {
    let list = [...allAppointments];

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    if (filterOption === "today") {
      list = list.filter((a) => sameDay(new Date(a.date), today));
    }

    if (filterOption === "tomorrow") {
      list = list.filter((a) => sameDay(new Date(a.date), tomorrow));
    }

    if (filterOption === "week") {
      list = list.filter((a) => {
        const d = new Date(a.date);
        return d >= todayStart && d <= weekEnd;
      });
    }

    if (filterDate) {
      const selected = new Date(`${filterDate}T00:00:00`);
      list = list.filter((a) => sameDay(new Date(a.date), selected));
    }

    const hasDateFilter = filterOption !== "all" || filterDate;
    if (!showPast && hasDateFilter) {
      list = list.filter((a) => new Date(a.date) >= todayStart);
    }

    if (showPendingOnly) {
      list = list.filter((a) => {
        if (a.status === "cancelled") return false;
        const total = a.servicePrice ?? a.service?.price ?? 0;
        const paid =
          a.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
        return new Date(a.date) < todayStart && total > 0 && paid < total;
      });
    }

    return list.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [allAppointments, filterDate, filterOption, showPast, showPendingOnly]);

  async function deleteAppointment(id: string) {
    try {
      haptic(20);
      await axios.delete(`/api/appointments/${id}`);
      toast("Turno eliminado", "success");
      fetchAppointments();
    } catch {
      toast("Error al eliminar turno", "error");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-4">
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-semibold">Turnos</h1>
      </div>

      {/* FILTROS */}
      <div className="bg-white dark:bg-[#252525] rounded-2xl px-3 py-3 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
          <button onClick={() => setFilterOption("all")} className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${filterOption === "all" ? "bg-black text-white border-black" : "text-gray-600 dark:text-gray-400 dark:border-gray-600"}`}>
            Todos
          </button>
          <button onClick={() => setFilterOption("today")} className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${filterOption === "today" ? "bg-black text-white border-black" : "text-gray-600 dark:text-gray-400 dark:border-gray-600"}`}>
            Hoy
          </button>
          <button onClick={() => setFilterOption("tomorrow")} className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${filterOption === "tomorrow" ? "bg-black text-white border-black" : "text-gray-600 dark:text-gray-400 dark:border-gray-600"}`}>
            Mañana
          </button>
          <button onClick={() => setFilterOption("week")} className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${filterOption === "week" ? "bg-black text-white border-black" : "text-gray-600 dark:text-gray-400 dark:border-gray-600"}`}>
            Semana
          </button>

          <div className="w-px h-5 bg-gray-200 shrink-0" />

          {/* Chip de fecha con picker nativo por detrás */}
          <div className="relative shrink-0">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${
                filterDate ? "bg-black text-white border-black" : "text-gray-600"
              }`}
              onClick={() => (document.getElementById("date-filter") as HTMLInputElement)?.showPicker?.()}
            >
              <CalendarDays size={13} />
              {filterDate
                ? format(new Date(filterDate + "T00:00:00"), "d MMM", { locale: es })
                : "Fecha"}
            </button>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="absolute -top-1 -right-1 bg-gray-300 rounded-full p-0.5"
              >
                <X size={9} />
              </button>
            )}
            <input
              id="date-filter"
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setFilterOption("all"); }}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
            />
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0" />

          <button
            onClick={() => setShowPendingOnly((v) => !v)}
            className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${showPendingOnly ? "bg-red-600 text-white border-red-600" : "text-gray-600"}`}
          >
            Deudas
          </button>
          <button
            onClick={() => setShowPast((v) => !v)}
            className={`px-3 py-1.5 border rounded-full text-sm whitespace-nowrap ${showPast ? "bg-black text-white border-black" : "text-gray-600"}`}
          >
            Ver pasados
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {appointments.length} turno{appointments.length !== 1 && "s"}
      </p>

      <div className="space-y-4">
        {appointments.map((a) => {
          const total = a.servicePrice ?? a.service?.price ?? 0;
          const paid =
            a.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
          const remaining = total - paid;
          const isPast = new Date(a.date).getTime() < todayStart.getTime();
          const hasDebt = isPast && remaining > 0;
          const info = getTimeInfo(a.date);

          return (
            <div
              key={a.id}
              className={`p-4 shadow dark:shadow-none rounded-2xl ${getCardStyle(
                info.state
              )} ${
                hasDebt ? "border border-red-400" : "border border-transparent"
              } ${info.state === "past" ? "" : "dark:border-gray-800"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <User size={16} /> {a.name} {a.lastName}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Phone size={14} /> {a.telefono}
                    {a.telefono && (
                      <a
                        href={`tel:${a.telefono.replace(/\D/g, "")}`}
                        className="text-blue-500 hover:text-blue-600 transition"
                        title="Llamar"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    {a.telefono && (
                      <a
                        href={`https://wa.me/${a.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-600 transition"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}
                    {a.instagram && (
                      <a
                        href={`https://ig.me/m/${a.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600 transition"
                        title="Enviar Instagram DM"
                      >
                        <Instagram size={14} />
                      </a>
                    )}
                  </p>

                  <p className="text-sm mt-2">{a.service?.name}</p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {format(new Date(a.date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })} hs
                  </p>
                </div>

                {total > 0 && (
                  <div className="text-right text-sm">
                    <p>Total: ${total}</p>

                    {paid === 0 && (
                      <p className="text-gray-500 dark:text-gray-400">
                        Sin pagos registrados
                      </p>
                    )}

                    {paid > 0 && paid < total && isPast && (
                      <>
                        <p>Pagado: ${paid}</p>
                        <p className="text-red-600 font-semibold">
                          Debe: ${remaining}
                        </p>
                      </>
                    )}

                    {paid > 0 && paid < total && !isPast && (
                      <>
                        <p>Pagado: ${paid}</p>
                        <p className="text-amber-600 font-semibold">
                          Falta: ${remaining}
                        </p>
                      </>
                    )}

                    {paid >= total && (
                      <p className="text-green-600 font-semibold">
                        Pago completo
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() =>
                    router.push(`/admin/edit/${a.id}`)
                  }
                  className="text-green-600 dark:text-green-500"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteAppointment(a.id)}
                  className="text-red-600 dark:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <EmptyState variant="appointments" title="No hay turnos" subtitle="Cambiá los filtros o creá un turno nuevo" />
        )}
      </div>
    </div>
  );
}
