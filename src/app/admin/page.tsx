"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  format,
  isToday,
  isTomorrow,
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

type Appointment = {
  id: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  date: string;
  service?: { name?: string };
};

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const router = useRouter();

  async function fetchAppointments(date?: string) {
    const res = await axios.get(
      `/api/appointments${date ? `?date=${date}` : ""}`
    );

    const ordered = Array.isArray(res.data)
      ? res.data.sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
      : [];

    setAppointments(ordered);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await axios.delete(`/api/appointments?id=${id}`);
    fetchAppointments(filterDate);
  }

  /* ================= HELPERS ================= */

  function getTimeLabel(date: string) {
    const diffMin = differenceInMinutes(new Date(date), new Date());

    if (diffMin < 0) return null;
    if (diffMin < 60) return `En ${diffMin} min`;
    if (diffMin < 1440) return `En ${Math.floor(diffMin / 60)}h`;
    if (isTomorrow(new Date(date))) return "Mañana";

    return null;
  }

  function groupAppointments() {
    return {
      hoy: appointments.filter((a) =>
        isToday(new Date(a.date))
      ),
      manana: appointments.filter((a) =>
        isTomorrow(new Date(a.date))
      ),
      proximos: appointments.filter(
        (a) =>
          !isToday(new Date(a.date)) &&
          !isTomorrow(new Date(a.date))
      ),
    };
  }

  const groups = groupAppointments();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Turnos
      </h1>

      {/* FILTRO */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="minimal-input w-full"
          />
          {!filterDate && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
              Filtrar por fecha
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchAppointments(filterDate)}
            className="bg-black text-white px-4 py-2 rounded-xl transition hover:scale-[1.03]"
          >
            Filtrar
          </button>

          <button
            onClick={() => {
              setFilterDate("");
              fetchAppointments();
            }}
            className="px-4 py-2 rounded-xl border"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="sm:hidden space-y-8">
        {(
          [
            ["Hoy", groups.hoy],
            ["Mañana", groups.manana],
            ["Próximos", groups.proximos],
          ] as const
        ).map(
          ([title, items]) =>
            items.length > 0 && (
              <div key={title} className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {title}
                </h2>

                {items.map((a, i) => {
                  const isPast =
                    new Date(a.date) < new Date();
                  const label = getTimeLabel(a.date);

                  return (
                    <div
                      key={a.id}
                      style={{
                        animationDelay: `${i * 60}ms`,
                      }}
                      className={`relative bg-white rounded-2xl p-4 shadow animate-fade-up ${
                        isPast ? "opacity-60" : ""
                      }`}
                    >
                      {/* BARRA */}
                      <span
                        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                          isPast
                            ? "bg-gray-300"
                            : "bg-green-500"
                        }`}
                      />

                      <div className="space-y-3 pl-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              <User size={16} />
                              {a.name} {a.lastName}
                            </p>

                            {a.telefono && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone size={14} />
                                {a.telefono}
                              </p>
                            )}
                          </div>

                          {label && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              {label}
                            </span>
                          )}
                        </div>

                        <p className="text-sm">
                          {a.service?.name}
                        </p>

                        <div className="text-sm text-gray-600 flex flex-col">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={14} />
                            {format(
                              new Date(a.date),
                              "dd/MM/yyyy",
                              { locale: es }
                            )}
                          </span>
                          <span className="text-xs text-gray-500 ml-6">
                            {format(
                              new Date(a.date),
                              "HH:mm"
                            )}{" "}
                            hs
                          </span>
                        </div>

                        <div className="flex justify-end gap-4 pt-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/edit/${a.id}`
                              )
                            }
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              deleteAppointment(a.id)
                            }
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
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
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  {a.name} {a.lastName}
                </td>
                <td className="p-3">{a.telefono}</td>
                <td className="p-3">
                  {a.service?.name}
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span>
                      {format(
                        new Date(a.date),
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(
                        new Date(a.date),
                        "HH:mm"
                      )}{" "}
                      hs
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/edit/${a.id}`
                        )
                      }
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        deleteAppointment(a.id)
                      }
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
      </div>
    </div>
  );
}
