"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default function AppointmentDetail({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/appointments?id=${params.id}`)
      .then((res) => res.json())
      .then(setAppointment);
  }, [params.id]);

  if (!appointment) {
    return <p className="p-6 text-center">Cargando turno...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">

        {/* ✏️ EDITAR */}
        <button
          onClick={() => router.push(`/admin/edit/${params.id}`)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
        >
          ✏️
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">
          📅 Detalle del Turno
        </h1>

        <div className="space-y-3 text-sm">

          <Info label="Cliente">
            {appointment.name} {appointment.lastName}
          </Info>

          <Info label="Teléfono">
            {appointment.telefono}
          </Info>

          <Info label="Servicio">
            {appointment.service?.name}
          </Info>

          <Info label="Fecha y hora">
            {format(new Date(appointment.date), "dd/MM/yyyy HH:mm", {
              locale: es,
            })} hs
          </Info>

          <Info label="Estado">
            <span className="capitalize">{appointment.status}</span>
          </Info>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-xl hover:bg-gray-100"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}
