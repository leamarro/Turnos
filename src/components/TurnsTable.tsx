"use client";

import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  name?: string | null;
  lastName?: string | null;
  telefono?: string | null;
  service: {
    name: string;
    price?: number;
  } | null;
  servicePrice?: number | null;
};

function statusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function TurnsTable({
  data,
  loading,
}: {
  data: Appointment[];
  loading: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) return <p className="p-4 text-sm">Cargando turnos…</p>;
  if (data.length === 0) return <p className="p-4 text-sm">No hay turnos</p>;

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {a.name} {a.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {a.service?.name ?? "—"}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${statusStyle(
                  a.status
                )}`}
              >
                {a.status}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {new Date(a.date).toLocaleDateString("es")}{" "}
                {new Date(a.date).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="font-semibold">
                $ {a.servicePrice ?? a.service?.price ?? 0}
              </span>
            </div>

            {a.telefono && (
              <p className="text-xs text-gray-500">{a.telefono}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Cliente</th>
          <th className="p-3 text-left">Teléfono</th>
          <th className="p-3 text-left">Servicio</th>
          <th className="p-3 text-left">Fecha</th>
          <th className="p-3 text-right">Precio</th>
          <th className="p-3 text-center">Estado</th>
        </tr>
      </thead>

      <tbody>
        {data.map((a) => (
          <tr key={a.id} className="border-t hover:bg-gray-50">
            <td className="p-3 font-medium">
              {a.name} {a.lastName}
            </td>
            <td className="p-3">{a.telefono ?? "—"}</td>
            <td className="p-3">{a.service?.name ?? "—"}</td>
            <td className="p-3">
              {new Date(a.date).toLocaleString()}
            </td>
            <td className="p-3 text-right">
              $ {a.servicePrice ?? a.service?.price ?? 0}
            </td>
            <td className="p-3 text-center capitalize">
              <span
                className={`px-2 py-1 rounded-full text-xs ${statusStyle(
                  a.status
                )}`}
              >
                {a.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
