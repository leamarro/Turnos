"use client";

import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  name?: string | null;
  lastName?: string | null;
  telefono?: string | null;
  notes?: string | null;
  service: {
    name: string;
    price?: number;
  } | null;
  servicePrice?: number | null;
};

export default function TurnsTable({
  data,
  loading,
}: {
  data: Appointment[];
  loading: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading) {
    return <p className="p-4 text-sm">Cargando turnos...</p>;
  }

  if (data.length === 0) {
    return <p className="p-4 text-sm">No hay turnos</p>;
  }

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-gray-100"
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

              <span className="font-semibold text-sm">
                $ {a.servicePrice ?? a.service?.price ?? 0}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {new Date(a.date).toLocaleDateString("es")}
              </span>
              <span>
                {new Date(a.date).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {a.telefono && (
              <p className="text-xs text-gray-500">
                📞 {a.telefono}
              </p>
            )}

            {/* ✅ NOTA BONITA */}
            {a.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Nota</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {a.notes}
                </p>
              </div>
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
          <th className="p-3 text-left">Nota</th> {/* ✅ NUEVA COLUMNA */}
          <th className="p-3 text-right">Precio</th>
          <th className="p-3 text-center">Estado</th>
        </tr>
      </thead>

      <tbody>
        {data.map((a) => (
          <tr key={a.id} className="border-t hover:bg-gray-50 align-top">
            <td className="p-3 font-medium">
              {a.name} {a.lastName}
            </td>

            <td className="p-3">{a.telefono ?? "—"}</td>

            <td className="p-3">{a.service?.name ?? "—"}</td>

            <td className="p-3">
              {new Date(a.date).toLocaleString()}
            </td>

            {/* ✅ NOTA EN DESKTOP */}
            <td className="p-3 max-w-xs">
              {a.notes ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 whitespace-pre-wrap">
                  {a.notes}
                </div>
              ) : (
                "—"
              )}
            </td>

            <td className="p-3 text-right">
              $ {a.servicePrice ?? a.service?.price ?? 0}
            </td>

            <td className="p-3 text-center capitalize">
              {a.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
