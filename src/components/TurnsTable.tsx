"use client";

import Link from "next/link";

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

export default function TurnsTable({
  data,
  loading,
}: {
  data: Appointment[];
  loading: boolean;
}) {
  if (loading) {
    return <p className="p-4 text-sm">Cargando turnos...</p>;
  }

  if (data.length === 0) {
    return <p className="p-4 text-sm">No hay turnos</p>;
  }

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

            <td className="p-3">
              {a.telefono ?? "—"}
            </td>

            <td className="p-3">
              {a.service?.name ?? "—"}
            </td>

            <td className="p-3">
              {new Date(a.date).toLocaleString()}
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
