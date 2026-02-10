"use client"

import { useState } from "react"

type AppointmentFormProps = {
  initialData?: {
    date?: string
    name?: string
    lastName?: string
    serviceId?: string
    notes?: string
  }
  onSubmit: (data: any) => Promise<void>
}

export default function AppointmentForm({
  initialData,
  onSubmit,
}: AppointmentFormProps) {
  const [form, setForm] = useState({
    date: initialData?.date ?? "",
    name: initialData?.name ?? "",
    lastName: initialData?.lastName ?? "",
    serviceId: initialData?.serviceId ?? "",
    notes: initialData?.notes ?? "",
  })

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...form,
        notes: form.notes || null, // 👈 opcional
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Fecha */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Fecha y hora</label>
        <input
          type="datetime-local"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* Apellido */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Apellido</label>
        <input
          type="text"
          value={form.lastName}
          onChange={(e) =>
            setForm({ ...form, lastName: e.target.value })
          }
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* Servicio */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Servicio</label>
        <select
          value={form.serviceId}
          onChange={(e) =>
            setForm({ ...form, serviceId: e.target.value })
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Seleccionar</option>
          <option value="makeup">Maquillaje</option>
          <option value="makeup15">Maquillaje 15</option>
          <option value="social">Social</option>
        </select>
      </div>

      {/* 📝 OBSERVACIONES */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Observaciones (interno)
        </label>

        <textarea
          placeholder="Ej: pagó seña $10.000 · domicilio · maquillaje 15"
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
          rows={3}
          className="w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />

        <span className="text-xs text-gray-400">
          Solo visible para vos
        </span>
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-pink-500 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar turno"}
      </button>
    </form>
  )
}
