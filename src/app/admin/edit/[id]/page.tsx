"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

  async function handleDelete() {
    if (!confirm("¿Eliminar turno?")) return;
    await axios.delete(`/api/appointments/${id}`);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">

        <h1 className="text-lg font-bold text-center">
          Editar Turno
        </h1>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="input" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" className="input" />
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className="input" />
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="input" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" className="input" />

        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input">
          <option value="">Seleccionar servicio</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input w-1/2" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input w-1/2" />
        </div>

        {/* RESUMEN */}
        <div className="bg-gray-100 p-4 rounded-xl space-y-1 text-sm">
          <p>Total servicio: ${totalServicio}</p>
          <p>Total pagado: ${totalPagado}</p>
          {!pagoCompleto ? (
            <p className="font-semibold text-red-600">Restante: ${restante}</p>
          ) : (
            <p className="font-semibold text-green-600">Pago completo</p>
          )}
        </div>

        {/* HISTORIAL */}
        {payments.length > 0 && (
          <div className="border p-4 rounded-xl space-y-3 text-sm">
            <p className="font-semibold">Historial de pagos</p>

            {payments.map((p) => {
              const fecha = new Date(p.createdAt).toLocaleDateString("es-AR");
              const metodo =
                p.method === "deposit"
                  ? "Seña"
                  : p.method === "full"
                  ? "Pago final"
                  : p.method === "cash"
                  ? "Efectivo"
                  : p.method;

              return (
                <div key={p.id} className="flex justify-between border-b pb-2">
                  <div>
                    <p>{metodo}</p>
                    <p className="text-xs text-gray-500">{fecha}</p>
                  </div>
                  <span className="font-medium">${p.amount}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* BLOQUE PAGOS */}
        <div className="space-y-4">
          {!pagoCompleto && (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Monto de seña"
                  className="input flex-1"
                />

                <button
                  onClick={handleAddDeposit}
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                  className="bg-blue-600 text-white px-4 rounded-xl disabled:bg-gray-400"
                >
                  Agregar
                </button>
              </div>

              <button
                onClick={handleCompletePayment}
                className="w-full bg-green-600 text-white py-2 rounded-xl"
              >
                Completar pago (${restante})
              </button>
            </>
          )}

          {pagoCompleto && (
            <div className="bg-green-100 text-green-700 text-center py-3 rounded-xl font-semibold">
              ✅ Pago completado
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleDelete} className="bg-red-600 text-white py-2 rounded-xl w-full">
            Eliminar
          </button>

          <button onClick={handleSave} className="bg-black text-white py-2 rounded-xl w-full">
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
