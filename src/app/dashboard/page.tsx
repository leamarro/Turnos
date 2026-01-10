"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { exportToCsv } from "@/lib/exportCsv";
import StatCard from "@/components/StatCard";
import TurnsTable from "@/components/TurnsTable";
import MonthlyIncomeByServiceChart from "@/components/MonthlyIncomeByServiceChart";

type Appointment = {
  id: string;
  date: string;
  status: string;
  service: { id: string; name: string; price?: number } | null;
  user: { id: string; name?: string | null; telefono?: string | null } | null;
  servicePrice?: number | null;
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/appointments", { cache: "no-store" });
        if (!res.ok) throw new Error("Error cargando turnos");
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ERROR FETCH APPOINTMENTS:", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // =========================
  // FILTROS
  // =========================
  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const qq = q.toLowerCase();
        const d = new Date(a.date);

        if (q) {
          const name = a.user?.name?.toLowerCase() ?? "";
          const phone = a.user?.telefono ?? "";
          const service = a.service?.name?.toLowerCase() ?? "";
          if (!name.includes(qq) && !phone.includes(qq) && !service.includes(qq))
            return false;
        }

        if (from && d < new Date(`${from}T00:00:00`)) return false;
        if (to && d > new Date(`${to}T23:59:59`)) return false;

        if (selectedMonth !== "all") {
          const [year, month] = selectedMonth.split("-");
          if (
            d.getFullYear() !== Number(year) ||
            d.getMonth() !== Number(month)
          )
            return false;
        }

        if (selectedStatus !== "all" && a.status !== selectedStatus)
          return false;

        return true;
      })
      .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
  }, [appointments, q, from, to, selectedMonth, selectedStatus]);

  // =========================
  // MÉTRICAS
  // =========================
  const totalTurns = filtered.length;

  const turnsToday = filtered.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const incomeMonth = useMemo(() => {
    return filtered.reduce((sum, a) => {
      return sum + (a.servicePrice ?? a.service?.price ?? 0);
    }, 0);
  }, [filtered]);

  const topService = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  }, [filtered]);

  // =========================
  // MESES DISPONIBLES
  // =========================
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.date);
      set.add(`${d.getFullYear()}-${d.getMonth()}`);
    });
    return [...set];
  }, [appointments]);

  // =========================
  // EXPORTAR CSV
  // =========================
  const handleExport = () => {
    exportToCsv(
      "turnos.csv",
      filtered.map((a) => ({
        id: a.id,
        date: new Date(a.date).toLocaleString(),
        client: a.user?.name ?? "",
        telefono: a.user?.telefono ?? "",
        service: a.service?.name ?? "",
        price: a.servicePrice ?? a.service?.price ?? 0,
        status: a.status,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
       <main className="w-full max-w-7xl mx-auto pt-20 p-4 sm:p-6 space-y-6">

        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* ✅ SELECTOR DE MES PARA EL GRÁFICO */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md p-2 max-w-xs"
          >
            <option value="all">Todos los meses</option>
            {availableMonths.map((m) => {
              const [y, mo] = m.split("-");
              return (
                <option key={m} value={m}>
                  {new Date(Number(y), Number(mo)).toLocaleDateString("es", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              );
            })}
          </select>
        </div>

        {/* ✅ GRÁFICO FILTRADO POR MES */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Ingresos por mes</h2>
          <MonthlyIncomeByServiceChart selectedMonth={selectedMonth} />
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Turnos totales" value={totalTurns.toString()} />
          <StatCard title="Ingresos (mes)" value={`$ ${incomeMonth}`} />
          <StatCard title="Turnos hoy" value={turnsToday.toString()} />
          <StatCard title="Servicio top" value={topService} />
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
          <input
            type="date"
            value={from ?? ""}
            onChange={(e) => setFrom(e.target.value || null)}
            className="border rounded-md p-2 w-full"
          />

          <input
            type="date"
            value={to ?? ""}
            onChange={(e) => setTo(e.target.value || null)}
            className="border rounded-md p-2 w-full"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <input
            placeholder="Buscar cliente / servicio / teléfono"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded-md p-2 w-full"
          />

          {/* ✅ EXPORT DESKTOP */}
          <button
            onClick={handleExport}
            className="hidden sm:block bg-black text-white px-4 py-2 rounded-md w-full"
          >
            Exportar CSV
          </button>
        </div>

        {/* ✅ EXPORT MOBILE */}
        <button
          onClick={handleExport}
          className="block sm:hidden bg-black text-white px-4 py-2 rounded-md w-full"
        >
          Exportar CSV
        </button>

        {/* ✅ TABLA DESKTOP */}
        <div className="hidden sm:block bg-white rounded-lg shadow p-4 overflow-x-auto">
          <TurnsTable data={filtered} loading={loading} />
        </div>

        {/* ✅ MOBILE CARDS */}
        <div className="block sm:hidden space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow p-4 border space-y-2"
            >
              <div className="flex justify-between">
                <span className="font-semibold">
                  {a.user?.name || "Sin nombre"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(a.date).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm">📞 {a.user?.telefono}</p>
              <p className="text-sm">💄 {a.service?.name}</p>
              <p className="text-sm">
                💰 $ {a.servicePrice ?? a.service?.price ?? 0}
              </p>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
