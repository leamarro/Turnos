"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type Service = { id: string; name: string; duration: number; price: number };

export default function AppointmentForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);

useEffect(() => {
  async function fetchServices() {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Error al obtener servicios");
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchServices();
}, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const userResp = await axios.post("/api/users", { name, email });
      const userId = userResp.data.id;

      await axios.post("/api/appointments", { userId, serviceId, date });
      setMessage("Turno reservado correctamente ✅");
    } catch (err) {
      console.error(err);
      setMessage("Error al reservar turno");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <input required placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} className="input w-full"/>
      <input required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" className="input w-full"/>
      <select value={serviceId} onChange={e => setServiceId(e.target.value)} className="input w-full">
        {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.duration} min</option>)}
      </select>
      <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="input w-full"/>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Reservar turno</button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </form>
  );
}
