"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  price?: number;
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  createdAt: string;
};

type Appointment = {
  id: string;
  date?: string;
  status?: string;
  name?: string;
  lastName?: string;
  telefono?: string;
  instagram?: string;
  notes?: string;
  servicePrice?: number | null;
  service?: Service | null;
  payments?: Payment[];
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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("confirmed");

  async function fetchAppointment() {
    const ap = await axios.get(`/api/appointments/${id}`);
    const data: Appointment = ap.data;

    setAppointment(data);

    setName(data.name ?? "");
    setLastName(data.lastName ?? "");
    setTelefono(data.telefono ?? "");
    setInstagram(data.instagram ?? "");
    setNotes(data.notes ?? "");
    setServiceId(data.service?.id ?? "");
    setStatus(data.status ?? "confirmed");

    if (data.date) {
      const d = new Date(data.date);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");

      setDate(`${yyyy}-${mm}-${dd}`);
      setTime(`${hh}:${mi}`);
    }
  }

  useEffect(() => {
    async function loadData() {
      const sv = await axios.get("/api/services");
      setServices(sv.data);
      await fetchAppointment();
    }

    if (id) loadData();
  }, [id]);

  if (!appointment) {
    return <p className="p-6">Cargando...</p>;
  }

  const payments = appointment.payments ?? [];

  const visiblePayments = payments.filter((p) => p.method !== "pendiente");

  const totalServicio = appointment.servicePrice ?? 0;

  const totalPagado = payments.reduce((acc, p) => acc + p.amount, 0);

  const restante = totalServicio - totalPagado;

  const pagoCompleto = restante <= 0;

  async function handleSave() {
    await axios.put(`/api/appointments/${id}`, {
      name,
      lastName,
      telefono,
      instagram,
      notes,
      serviceId,
      date: date && time ? new Date(`${date}T${time}`) : undefined,
      status,
    });

    router.push("/admin");
  }

  async function handleAddDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;

    await axios.post(`/api/appointments/${id}/add-deposit`, {
      amount: Number(depositAmount),
    });

    setDepositAmount("");
    await fetchAppointment();
  }

  async function handleCompletePayment() {
    await axios.post(`/api/appointments/${id}/complete-payment`);
    await fetchAppointment();
  }

  async function handleMarkUnpaid() {
    if (!confirm("¿Marcar el turno como no pagado?")) return;
    await axios.post(`/api/appointments/${id}/mark-unpaid`);
    await fetchAppointment();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar turno?")) return;

    await axios.delete(`/api/appointments/${id}`);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-6">
      <div className="max-w-md mx-auto bg-white dark:bg-[#252525] shadow-xl dark:shadow-none dark:border dark:border-gray-800 rounded-2xl p-6 space-y-5">

        <h1 className="text-lg font-bold text-center">
          Editar Turno
        </h1>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="input"
        />

        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          className="input"
        />

        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono"
          className="input"
        />

        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram"
          className="input"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas"
          className="input"
        />

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="input"
        >
          <option value="">Seleccionar servicio</option>

          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-1/2"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input w-1/2"
          />
        </div>

        {/* RESUMEN */}
        <div className="bg-gray-100 dark:bg-[#2a2a2a] p-4 rounded-xl text-sm space-y-1">
          <p>Total servicio: {formatMoney(totalServicio)}</p>
          <p>Total pagado: {formatMoney(totalPagado)}</p>

          {restante > 0 && (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Restante: {formatMoney(restante)}
            </p>
          )}

          {pagoCompleto && (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              Pago completo
            </p>
          )}
        </div>

        {/* HISTORIAL */}
        {visiblePayments.length > 0 && (
          <div className="border dark:border-gray-700 rounded-xl p-4 space-y-3 text-sm">
            <p className="font-semibold">Historial de pagos</p>

            {visiblePayments.map((p) => {
              const fecha = new Date(p.createdAt).toLocaleDateString(
                "es-AR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              );

              const metodo =
                p.method === "deposit"
                  ? "Seña"
                  : p.method === "full"
                  ? "Pago final"
                  : p.method === "cash"
                  ? "Efectivo"
                  : p.method;

              return (
                <div
                  key={p.id}
                  className="flex justify-between border-b dark:border-gray-800 pb-2"
                >
                  <div>
                    <p>{metodo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fecha}</p>
                  </div>

                  <span className="font-medium">
                    {formatMoney(p.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* AGREGAR SEÑA */}
        <div className="space-y-2">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={pagoCompleto}
            placeholder="Agregar seña"
            className="input disabled:bg-gray-200 dark:disabled:bg-[#333]"
          />

          <button
            onClick={handleAddDeposit}
            disabled={pagoCompleto}
            className="w-full bg-blue-600 text-white py-2 rounded-xl disabled:bg-gray-400"
          >
            Agregar seña
          </button>
        </div>

        {/* COMPLETAR PAGO */}
        {!pagoCompleto ? (
          <button
            onClick={handleCompletePayment}
            className="w-full bg-green-700 text-white py-2 rounded-xl"
          >
            Completar pago
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-center py-2 rounded-xl">
              Pago completado
            </div>

            <button
              onClick={handleMarkUnpaid}
              className="w-full border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 py-2 rounded-xl"
            >
              Marcar como no pagado
            </button>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 rounded-xl w-full"
          >
            Eliminar
          </button>

          <button
            onClick={handleSave}
            className="bg-brand text-brand-contrast py-2 rounded-xl w-full"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
