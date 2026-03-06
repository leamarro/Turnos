"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams()

  const [appointment, setAppointment] = useState<any>(null)
  const [deposit, setDeposit] = useState("")
  const [method, setMethod] = useState("Efectivo")

  const fetchAppointment = async () => {
    const res = await fetch(`/api/appointments/${params.id}`)
    const data = await res.json()
    setAppointment(data)
  }

  useEffect(() => {
    fetchAppointment()
  }, [])

  if (!appointment) return <p className="p-10">Cargando...</p>

  const payments = appointment.payments || []

  const totalPaid = payments.reduce((acc: number, p: any) => acc + p.amount, 0)

  const totalPrice = appointment.price || 0

  const remaining = Math.max(totalPrice - totalPaid, 0)

  const isPaid = remaining === 0 && totalPrice > 0

  const addDeposit = async () => {
    if (!deposit) return

    await fetch(`/api/appointments/${appointment.id}/add-deposit`, {
      method: "POST",
      body: JSON.stringify({
        amount: Number(deposit),
        method,
      }),
    })

    setDeposit("")
    fetchAppointment()
  }

  const completePayment = async () => {
    if (remaining <= 0) return

    await fetch(`/api/appointments/${appointment.id}/add-deposit`, {
      method: "POST",
      body: JSON.stringify({
        amount: remaining,
        method,
      }),
    })

    fetchAppointment()
  }

  const deleteAppointment = async () => {
    if (!confirm("Eliminar turno?")) return

    await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    })

    router.push("/admin")
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">Editar turno</h1>

      <div className="border rounded-xl p-4 space-y-1 text-sm bg-gray-50">
        {totalPrice > 0 && (
          <>
            <p>Total: ${totalPrice}</p>
            <p>Pagado: ${totalPaid}</p>

            {remaining > 0 ? (
              <p className="text-red-600 font-semibold">
                Debe: ${remaining}
              </p>
            ) : (
              <p className="text-green-600 font-semibold">
                Pago completo
              </p>
            )}
          </>
        )}
      </div>

      {!isPaid && (
        <div className="border p-4 rounded-xl space-y-3">

          <p className="font-semibold">Agregar seña</p>

          <input
            type="number"
            placeholder="Monto"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Mercado Pago</option>
          </select>

          <button
            onClick={addDeposit}
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            Agregar seña
          </button>

          {remaining > 0 && (
            <button
              onClick={completePayment}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Completar pago (${remaining})
            </button>
          )}
        </div>
      )}

      {payments.length > 0 && (
        <div className="border p-4 rounded-xl space-y-2 text-sm">

          <p className="font-semibold">Historial de pagos</p>

          {payments.map((p: any) => (
            <div
              key={p.id}
              className="flex justify-between border-b pb-1"
            >
              <span>
                ${p.amount} • {p.method}
              </span>

              <span className="text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={deleteAppointment}
        className="bg-red-600 text-white px-4 py-2 rounded w-full"
      >
        Eliminar turno
      </button>

    </div>
  )
}
