"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  price: number;
};

type Payment = {
  id: string;
  amount: number;
};

type Appointment = {
  id: string;
  date: string;
  status: string;
  name: string;
  lastName: string | null;
  telefono: string | null;
  instagram: string | null;
  notes: string | null;
  servicePrice: number | null;
  service: Service | null;
  payments: Payment[];
};

export default function EditAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const id = params.id;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [depositAmount, setDepositAmount] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [status, setStatus] = useState("confirmed");

  useEffect(() => {
    async function loadData() {
      const ap = await axios.get(`/api/appointments/${id}`);
      const sv = await axios.get("/api/services");

      const a: Appointment = ap.data;

      setAppointment(a);
      setServices(sv.data);

      setName(a.name ?? "");
      setLastName(a.lastName ?? "");
      setTelefono(a.telefono ?? "");
      setInstagram(a.instagram ?? "");
      setNotes(a.notes ?? "");
      setServiceId(a.service?.id ?? "");
      setStatus(a.status ?? "confirmed");
    }

    loadData();
  }, [id]);

  if (!appointment) return <p className="p-6">Cargando...</p>;

  const totalServicio = appointment.servicePrice ?? 0;
  const totalPagado = appointment.payments.reduce(
    (acc, p) => acc + p.amount,
    0
  );
  const restante = totalServicio - totalPagado;

  async function handleSave() {
    await axios.put(`/api/appointments/${id}`, {
      name,
      lastName,
      telefono,
      instagram,
      notes,
      serviceId,
      status,
    });

    router.push("/admin");
  }

  async function handleAddDeposit() {
    if (!depositAmount) return;

    await axios.post(`/api/appointments/${id}/add-deposit`, {
      amount: Number(depositAmount),
    });

    router.refresh();
  }

  async function handleCompletePayment() {
    await axios.post(`/api/appointments/${id}/complete-payment`);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl p-6 rounded-2xl space-y-4 mt-10">

      <h1 className="text-lg font-semibold text-center">
        Editar Turno
      </h1>

      {/* DATOS CLIENTE */}
      <input
        className="w-full border rounded-lg px-3 py-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Apellido"
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        value={telefono ?? ""}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="Teléfono"
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        value={instagram ?? ""}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="Instagram"
      />

      <textarea
        className="w-full border rounded-lg px-3 py-2"
        value={notes ?? ""}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas"
      />

      {/* SERVICIO */}
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
      >
        <option value="">Seleccionar servicio</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* RESUMEN FINANCIERO */}
      <div className="bg-gray-100 p-4 rounded-xl space-y-1 text-sm">
        <p>Total servicio: ${totalServicio}</p>
        <p>Total pagado: ${totalPagado}</p>
        <p className="font-semibold text-red-600">
          Restante: ${restante}
        </p>
      </div>

      {/* AGREGAR SEÑA */}
      <div className="space-y-2">
        <input
          type="number"
          placeholder="Agregar seña"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          onClick={handleAddDeposit}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          Agregar seña
        </button>
      </div>

      {/* COMPLETAR PAGO */}
      {restante > 0 && (
        <button
          onClick={handleCompletePayment}
          className="w-full bg-green-600 text-white py-2 rounded-xl"
        >
          Completar pago
        </button>
      )}

      {/* GUARDAR */}
      <button
        onClick={handleSave}
        className="w-full bg-black text-white py-2 rounded-xl"
      >
        Guardar cambios
      </button>
    </div>
  );
}
