"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

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
  time: string;
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
  time: "",
  depositAmount: "",
  notes: "",
};

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
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
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export default function AppointmentForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [createdAppointment, setCreatedAppointment] = useState<{
    id: string;
    date: string;
  } | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === form.serviceId),
    [form.serviceId, services]
  );

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoadingServices(true);
        const res = await axios.get("/api/services");
        if (active) setServices(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        if (active) {
          setMessage("No se pudieron cargar los servicios. Intentá nuevamente.");
        }
      } finally {
        if (active) setLoadingServices(false);
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateForm() {
    if (
      !form.name.trim() ||
      !form.lastName.trim() ||
      !form.telefono.trim() ||
      !form.serviceId ||
      !form.date ||
      !form.time
    ) {
      return "Completá los datos obligatorios para cargar el turno.";
    }

    if (form.telefono.length < 8) {
      return "Revisá el teléfono. Usá solo números, sin 0 ni 15.";
    }

    if (!isValidTime(form.time)) {
      return "Ingresá una hora válida en formato HH:mm.";
    }

    if (form.depositAmount && Number(form.depositAmount) < 0) {
      return "La seña no puede ser negativa.";
    }

    const selectedDate = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return "La fecha seleccionada no es válida.";
    }

    if (selectedDate.getTime() < Date.now()) {
      return "Elegí una fecha y hora futuras.";
    }

    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setMessage("");
    setSubmitting(true);

    try {
      const dateTime = new Date(`${form.date}T${form.time}:00`);
      const telefonoFinal = form.telefono.startsWith("54")
        ? `+${form.telefono}`
        : `+54${form.telefono}`;

      const res = await axios.post("/api/appointments", {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        telefono: telefonoFinal,
        instagram: form.instagram.trim() || null,
        serviceId: form.serviceId,
        date: dateTime,
        notes: form.notes.trim() || null,
        depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
      });

      setCreatedAppointment({ id: res.data.id, date: res.data.date });
      setForm(initialForm);
    } catch (err: any) {
      console.error(err.response?.data || err);
      setMessage(
        err.response?.data?.error ||
          "No se pudo guardar el turno. Revisá los datos e intentá de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdAppointment) {
    const date = new Date(createdAppointment.date);

    return (
      <section className="mx-auto w-full max-w-xl rounded-[28px] border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-emerald-600" />
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
              Turno cargado
            </p>
            <h2 className="text-2xl font-semibold text-zinc-950">
              El turno quedó registrado
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Fecha:{" "}
              <span className="font-medium text-zinc-950">
                {date.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}{" "}
                a las{" "}
                {date.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreatedAppointment(null)}
          className="mt-8 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Cargar otro turno
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Beat Makeup
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
            Nuevo turno
          </h1>
          <p className="max-w-md text-base leading-7 text-zinc-600">
            Cargá el servicio, fecha y horario del turno. También podés dejar
            una seña si corresponde.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <InfoItem icon={<Sparkles />} title="Servicios" text="Makeup y perfilado" />
          <InfoItem icon={<Clock3 />} title="Duración" text="Según el servicio" />
          <InfoItem icon={<Phone />} title="Contacto" text="Confirmación por WhatsApp" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" icon={<UserRound size={16} />} required>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Tu nombre"
              autoComplete="given-name"
              className="booking-input"
            />
          </Field>

          <Field label="Apellido" icon={<UserRound size={16} />} required>
            <input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Tu apellido"
              autoComplete="family-name"
              className="booking-input"
            />
          </Field>

          <Field label="Teléfono" icon={<Phone size={16} />} required>
            <input
              value={form.telefono}
              onChange={(e) =>
                updateField("telefono", normalizePhone(e.target.value))
              }
              placeholder="1123456789"
              inputMode="tel"
              autoComplete="tel"
              className="booking-input"
            />
          </Field>

          <Field label="Instagram">
            <input
              value={form.instagram}
              onChange={(e) =>
                updateField(
                  "instagram",
                  e.target.value ? `@${e.target.value.replace(/@+/g, "")}` : ""
                )
              }
              placeholder="@usuario"
              className="booking-input"
            />
          </Field>
        </div>

        <div className="mt-7 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-950">Servicio</p>
            {loadingServices && (
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 size={14} className="animate-spin" />
                Cargando
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {services.map((service) => (
              <button
                type="button"
                key={service.id}
                onClick={() => updateField("serviceId", service.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.serviceId === service.id
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold">
                      {service.name}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        form.serviceId === service.id
                          ? "text-zinc-300"
                          : "text-zinc-500"
                      }`}
                    >
                      {service.duration} min
                    </span>
                  </span>
                  <span className="text-sm font-semibold">
                    {formatMoney(service.price)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field label="Fecha" icon={<CalendarDays size={16} />} required>
            <input
              type="date"
              value={form.date}
              min={getTodayInputValue()}
              onChange={(e) => updateField("date", e.target.value)}
              className="booking-input"
            />
          </Field>

          <Field label="Hora" icon={<Clock3 size={16} />} required>
            <select
              value={form.time}
              onChange={(e) => updateField("time", e.target.value)}
              className="booking-input"
            >
              <option value="">Elegir horario</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Seña">
            <input
              type="number"
              min="0"
              value={form.depositAmount}
              onChange={(e) => updateField("depositAmount", e.target.value)}
              placeholder="Monto opcional"
              className="booking-input"
            />
          </Field>

          <Field label="Nota" icon={<MessageSquareText size={16} />}>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              placeholder="Detalle opcional"
              className="booking-input min-h-[48px] resize-none"
            />
          </Field>
        </div>

        {selectedService && (
          <div className="mt-6 rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
            <span className="font-medium text-zinc-950">
              {selectedService.name}
            </span>{" "}
            dura {selectedService.duration} minutos y cuesta{" "}
            {formatMoney(selectedService.price)}.
          </div>
        )}

        {message && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loadingServices}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Guardando..." : "Guardar turno"}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  icon,
  required = false,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactElement;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white">
        {icon}
      </div>
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}
