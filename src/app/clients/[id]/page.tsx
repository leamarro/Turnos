"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  service: {
    name: string;
  };
};

type Client = {
  name: string;
  lastName?: string;
  telefono: string;
  appointments: Appointment[];
};

export default function ClientDetail({
  params,
}: {
  params: { id: string };
}) {
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error");
        }
        return res.json();
      })
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p className="p-6">Cargando...</p>;

  if (error) {
    return (
      <p className="p-6 text-red-600">
        {error}
      </p>
    );
  }

  if (!client) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">
        {client.name} {client.lastName}
      </h1>

      <p className="text-gray-600 mb-6">{client.telefono}</p>

      <h2 className="font-semibold mb-3">Historial de turnos</h2>

      {client.appointments.length === 0 ? (
        <p className="text-gray-500">Este cliente no tiene turnos.</p>
      ) : (
        <div className="space-y-3">
          {client.appointments.map((a) => (
            <div
              key={a.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <p className="font-medium">{a.service.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(a.date).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Estado: {a.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
