"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState("");

  async function fetchAppointments(date?: string) {
    const res = await axios.get(
      `/api/appointments${date ? `?date=${date}` : ""}`
    );
    setAppointments(res.data);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function updateStatus(id: string, status: string) {
    await axios.put(`/api/appointments?id=${id}`, { status });
    fetchAppointments(filterDate);
  }

  async function deleteAppointment(id: string) {
    if (confirm("¿Eliminar este turno?")) {
      await axios.delete(`/api/appointments?id=${id}`);
      fetchAppointments(filterDate);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        📋 Panel de Administración de Turnos
      </h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6 flex flex-col sm:flex-row gap-3 items-center sm:justify-between">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded-lg p-2 w-full sm:w-auto"
        />

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchAppointments(filterDate)}
            className="flex-1 sm:flex-none bg-black text-white px-4 py-2 rounded-lg"
          >
            Filtrar
          </button>

          <button
            onClick={() => {
              setFilterDate("");
              fetchAppointments();
            }}
            className="flex-1 sm:flex-none border px-4 py-2 rounded-lg"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden space-y-4">
        {appointments.map((a) => (
          <div key={a.id} className="border rounded-2xl p-4 bg-white shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {a.name} {a.lastName}
                </p>
                <p className="text-sm text-gray-600">{a.telefono}</p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-gray-200">
                {a.status}
              </span>
            </div>

            <p className="mt-2">{a.service?.name}</p>

            <p className="text-sm mt-1">
              {format(new Date(a.date), "dd/MM/yyyy HH:mm", { locale: es })}
            </p>

            <div className="mt-3 space-y-2">
              <select
                value={a.status}
                onChange={(e) => updateStatus(a.id, e.target.value)}
                className="border rounded-lg p-2 w-full"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </select>

              <div className="flex justify-end gap-4">
                <button onClick={() => deleteAppointment(a.id)}>🗑️</button>
                <button
                  onClick={() =>
                    (window.location.href = `/admin/edit/${a.id}`)
                  }
                >
                  ✏️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Servicio</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-3">
                  {a.name} {a.lastName}
                </td>
                <td className="p-3">{a.telefono}</td>
                <td className="p-3">{a.service?.name}</td>
                <td className="p-3">
                  {format(new Date(a.date), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </td>

                <td className="p-3">
                  <select
                    value={a.status}
                    onChange={(e) =>
                      updateStatus(a.id, e.target.value)
                    }
                    className="border rounded-md p-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>

                <td className="p-3 text-center">
                  <button onClick={() => deleteAppointment(a.id)}>🗑️</button>
                  <button
                    onClick={() =>
                      (window.location.href = `/admin/edit/${a.id}`)
                    }
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="text-center p-4 text-gray-500">
            No hay turnos cargados.
          </p>
        )}
      </div>
    </div>
  );
}
