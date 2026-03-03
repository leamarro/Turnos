"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

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
  date: string;
  servicePrice?: number | null;
  service?: { name?: string };
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
      return "bg-green-200 border-l-4 border-green-600";
    case "soon":
      return "bg-green-100 border-l-4 border-green-400";
    case "past":
      return "bg-gray-50 opacity-50";
    default:
      return "bg-white";
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
  const router = useRouter();
  const today = new Date();

  async function fetchAppointments() {
    const res = await axios.get("/api/appointments");
    const ordered = Array.isArray(res.data)
      ? res.data.sort((a: Appointment, b: Appointment) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      : [];
    setAllAppointments(ordered);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const appointments = useMemo(() => {
    let list = [...allAppointments];

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

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

    if (!showPast) {
      list = list.filter((a) => new Date(a.date) >= todayStart);
    }

    if (showPendingOnly) {
      list = list.filter((a) => {
        const total = a.servicePrice ?? 0;
        const paid =
          a.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
        return paid < total;
      });
    }

    return list.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [allAppointments, filterDate, filterOption, showPast, showPendingOnly]);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-semibold text-center mb-6">Turnos</h1>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <button onClick={() => setFilterOption("all")} className="px-3 py-1 border rounded-full text-sm">
          Todos
        </button>

        <button onClick={() => setFilterOption("today")} className="px-3 py-1 border rounded-full text-sm">
          Hoy
        </button>

        <button onClick={() => setFilterOption("tomorrow")} className="px-3 py-1 border rounded-full text-sm">
          Mañana
        </button>

        <button onClick={() => setFilterOption("week")} className="px-3 py-1 border rounded-full text-sm">
          Semana
        </button>

        <button
          onClick={() => setShowPendingOnly((v) => !v)}
          className={`px-3 py-1 border rounded-full text-sm ${
            showPendingOnly ? "bg-red-600 text-white" : ""
          }`}
        >
          Solo pendientes
        </button>
      </div>

      {/* LISTADO */}
      <div className="space-y-4">
        {appointments.map((a) => {
          const total = a.servicePrice ?? 0;
          const paid =
            a.payments?.reduce((acc, p) => acc + p.amount, 0) ?? 0;
          const remaining = total - paid;
          const hasDebt = remaining > 0;
          const info = getTimeInfo(a.date);

          return (
            <div
              key={a.id}
              className={`rounded-2xl p-4 shadow ${getCardStyle(
                info.state
              )} ${
                hasDebt ? "border border-red-400" : "border border-green-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <User size={16} /> {a.name} {a.lastName}
                  </p>

                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone size={14} /> {a.telefono}
                  </p>

                  <p className="text-sm mt-2">{a.service?.name}</p>

                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(a.date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })} hs
                  </p>
                </div>

                {total > 0 && (
                  <div className="text-right text-sm">
                    <p>Total: ${total}</p>

                    {paid === 0 && (
                      <p className="text-gray-500">
                        Sin pagos registrados
                      </p>
                    )}

                    {paid > 0 && paid < total && (
                      <>
                        <p>Pagado: ${paid}</p>
                        <p className="text-red-600 font-semibold">
                          Debe: ${remaining}
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
                  className="text-green-600"
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
          <p className="text-center text-gray-500">
            No hay turnos para este filtro
          </p>
        )}
      </div>
    </div>
  );
}
