"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

type Client = {
  id: string; // ✅ ID REAL
  name: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  totalAppointments: number;
  lastAppointment: string | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch("/api/clients", { cache: "no-store" })
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => {
        console.error("ERROR CLIENTS PAGE:", err);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-[0.75rem] md:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Contacto</th>
              <th className="p-3 text-center">Turnos</th>
              <th className="p-3 text-left">Último turno</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {/* ✅ NAVEGAR POR ID */}
                  <Link
                    href={`/clients/${c.id}`}
                    className="underline font-medium"
                  >
                    {c.name} {c.lastName ?? ""}
                  </Link>
                </td>

                <td className="p-3">
                  {c.telefono
                    ? c.telefono
                    : c.instagram
                    ? c.instagram
                    : "—"}
                </td>

                <td className="p-3 text-center">
                  {c.totalAppointments}
                </td>

                <td className="p-3">
                  {c.lastAppointment
                    ? new Date(c.lastAppointment).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
