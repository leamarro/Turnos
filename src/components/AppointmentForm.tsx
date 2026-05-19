"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle2, Loader2 } from "lucide-react";

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type FormState = {
  name: string;
  lastName: string;
  telefono: string;
  instagram: string;
  serviceId: string;
  date: string;
  times: string[];
  depositAmount: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  lastName: "",
  telefono: "",
  instagram: "",
  serviceId: "",
  date: "",
  times: [],
  depositAmount: "",
  notes: "",
};

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTodayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function AppointmentForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [createdDates, setCreatedDates] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    axios.get("/api/services")
      .then((res) => { if (active) setServices(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (active) setMessage("No se pudieron cargar los servicios."); })
      .finally(() => { if (active) setLoadingServices(false); });
    return () => { active = false; };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((cur) => ({ ...cur, [key]: value }));
  }

  function toggleTime(slot: string) {
    setForm((cur) => {
      const already = cur.times.includes(slot);
      if (already) return { ...cur, times: cur.times.filter((t) => t !== slot) };
      if (cur.times.length >= 2) return cur; // máximo 2
      return { ...cur, times: [...cur.times, slot] };
    });
  }

  function validate() {
    if (!form.name.trim() || !form.lastName.trim() || !form.telefono.trim() || !form.serviceId || !form.date || form.times.length === 0)
      return "Completá los datos obligatorios.";
    if (form.telefono.length < 8)
      return "Revisá el teléfono (solo números, sin 0 ni 15).";
    for (const t of form.times) {
      const dt = new Date(`${form.date}T${t}:00`);
      if (dt.getTime() < Date.now()) return "Elegí una fecha y hora futuras.";
    }
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setMessage(err); return; }

    setMessage("");
    setSubmitting(true);

    const telefonoFinal = form.telefono.startsWith("54")
      ? `+${form.telefono}`
      : `+54${form.telefono}`;

    const base = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      telefono: telefonoFinal,
      instagram: form.instagram.trim() || null,
      serviceId: form.serviceId,
      notes: form.notes.trim() || null,
      depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
    };

    try {
      const results: string[] = [];
      for (const t of form.times) {
        const res = await axios.post("/api/appointments", {
          ...base,
          date: new Date(`${form.date}T${t}:00`),
        });
        results.push(res.data.date);
      }
      setCreatedDates(results);
      setForm(initialForm);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "No se pudo guardar el turno.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ===== ÉXITO ===== */
  if (createdDates.length > 0) {
    return (
      <div className="max-w-sm mx-auto text-center space-y-4 py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="text-xl font-semibold">
          {createdDates.length === 1 ? "Turno registrado" : "Turnos registrados"}
        </h2>
        {createdDates.map((d, i) => {
          const date = new Date(d);
          return (
            <p key={i} className="text-sm text-gray-600">
              {date.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })}
              {" "}a las{" "}
              {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          );
        })}
        <button
          onClick={() => setCreatedDates([])}
          className="mt-4 w-full bg-black text-white py-3 rounded-xl text-sm font-medium"
        >
          Cargar otro turno
        </button>
      </div>
    );
  }

  /* ===== FORMULARIO ===== */
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Nuevo turno</h1>

      {/* DATOS */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Nombre *</label>
            <input value={form.name} onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nombre" className="booking-input" autoComplete="given-name" />
          </div>
          <div>
            <label className="label">Apellido *</label>
            <input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Apellido" className="booking-input" autoComplete="family-name" />
          </div>
        </div>

        <div>
          <label className="label">Teléfono *</label>
          <input value={form.telefono}
            onChange={(e) => updateField("telefono", normalizePhone(e.target.value))}
            placeholder="1123456789" inputMode="tel" className="booking-input" />
        </div>

        <div>
          <label className="label">Instagram</label>
          <input value={form.instagram}
            onChange={(e) => updateField("instagram", e.target.value ? `@${e.target.value.replace(/@+/g, "")}` : "")}
            placeholder="@usuario" className="booking-input" />
        </div>
      </div>

      {/* SERVICIO */}
      <div className="space-y-2">
        <label className="label">Servicio *</label>
        {loadingServices ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Cargando...
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => updateField("serviceId", s.id)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border text-sm transition ${
                  form.serviceId === s.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className={form.serviceId === s.id ? "text-gray-300" : "text-gray-500"}>
                  {formatMoney(s.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FECHA */}
      <div className="space-y-2">
        <label className="label">Fecha *</label>
        <input
          type="date"
          value={form.date}
          min={getTodayInputValue()}
          onChange={(e) => { updateField("date", e.target.value); updateField("times", []); }}
          className="booking-input"
        />
      </div>

      {/* HORARIOS */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <label className="label">Horario *</label>
          <span className="text-xs text-gray-400">
            {form.times.length === 0 && "Elegí hasta 2"}
            {form.times.length === 1 && "Podés elegir uno más"}
            {form.times.length === 2 && "2 turnos seleccionados"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {timeSlots.map((slot) => {
            const selected = form.times.includes(slot);
            const disabled = !selected && form.times.length >= 2;
            return (
              <button
                type="button"
                key={slot}
                onClick={() => toggleTime(slot)}
                disabled={disabled}
                className={`py-2 rounded-lg text-sm font-medium transition ${
                  selected
                    ? "bg-black text-white"
                    : disabled
                    ? "bg-gray-50 text-gray-300 border border-gray-100"
                    : "bg-white text-gray-700 border border-gray-200 active:bg-gray-100"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEÑA Y NOTAS */}
      <div className="space-y-3">
        <div>
          <label className="label">Seña</label>
          <input
            type="number"
            min="0"
            value={form.depositAmount}
            onChange={(e) => updateField("depositAmount", e.target.value)}
            placeholder="Monto opcional"
            className="booking-input"
          />
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={2}
            placeholder="Detalle opcional"
            className="booking-input resize-none"
          />
        </div>
      </div>

      {message && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || loadingServices}
        className="w-full bg-black text-white py-3.5 rounded-xl font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Guardando..." : form.times.length === 2 ? "Guardar 2 turnos" : "Guardar turno"}
      </button>
    </form>
  );
}
