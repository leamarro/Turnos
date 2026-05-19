"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Instagram, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Client = {
  id: string;
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
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold mb-4">
        Clientes
        <span className="ml-2 text-sm font-normal text-gray-400">
          {clients.length}
        </span>
      </h1>

      {/* Mobile: cards */}
      <div className="sm:hidden space-y-2">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {c.name} {c.lastName ?? ""}
              </p>

              {c.telefono && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone size={11} />
                  {c.telefono}
                </p>
              )}
              {!c.telefono && c.instagram && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Instagram size={11} />
                  {c.instagram}
                </p>
              )}

              {c.lastAppointment && (
                <p className="text-xs text-gray-400 mt-1">
                  Último:{" "}
                  {format(new Date(c.lastAppointment), "d MMM yyyy", {
                    locale: es,
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{c.totalAppointments}</p>
                <p className="text-[10px] text-gray-400">turnos</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </Link>
        ))}

        {clients.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            Sin clientes aún
          </p>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-3 text-left font-medium text-gray-600">Nombre</th>
              <th className="p-3 text-left font-medium text-gray-600">Contacto</th>
              <th className="p-3 text-center font-medium text-gray-600">Turnos</th>
              <th className="p-3 text-left font-medium text-gray-600">Último turno</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="p-3">
                  <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                    {c.name} {c.lastName ?? ""}
                  </Link>
                </td>
                <td className="p-3 text-gray-500">
                  {c.telefono || c.instagram || "—"}
                </td>
                <td className="p-3 text-center font-medium">{c.totalAppointments}</td>
                <td className="p-3 text-gray-500">
                  {c.lastAppointment
                    ? format(new Date(c.lastAppointment), "d MMM yyyy", { locale: es })
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
