export const dynamic = "force-dynamic";

"use client";

import { useEffect, useState } from "react";

export default function ClientDetail({
  params,
}: {
  params: { id: string };
}) {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((res) => res.json())
      .then(setClient);
  }, [params.id]);

  if (!client) return <p className="p-6">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{client.name}</h1>
      <p className="text-gray-600 mb-4">{client.telefono}</p>

      <h2 className="font-semibold mb-2">Historial de turnos</h2>

      <div className="space-y-2">
        {client.appointments.map((a: any) => (
          <div
            key={a.id}
            className="border rounded-lg p-3 bg-white"
          >
            <p className="font-medium">{a.service.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(a.date).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Estado: {a.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
