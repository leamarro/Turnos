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
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
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
        const d = new Date(a.date);
        const qq = q.toLowerCase();

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
          const [y, m] = selectedMonth.split("-").map(Number);
          if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
        }

        if (selectedStatus !== "all" && a.status !== selectedStatus)
          return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, q, from, to, selectedMonth, selectedStatus]);

  // =========================
  // MÉTRICAS
  // =========================
  const totalTurns = filtered.length;

  const turnsToday = filtered.filter((a) => {
    const d = new Date(a.date);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const incomeMonth = useMemo(
    () =>
      filtered.reduce(
        (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
        0
      ),
    [filtered]
  );

  const topService = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [filtered]);

  // =========================
  // MESES DISPONIBLES
  // =========================
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.date);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
    });
    return [...set];
  }, [appointments]);

  // =========================
  // EXPORT CSV
  // =========================
  const handleExport = () => {
    exportToCsv(
      "turnos.csv",
      filtered.map((a) => {
        const d = new Date(a.date);
        return {
          fecha: d.toLocaleDateString("es"),
          hora: d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
          cliente: a.user?.name ?? "",
          telefono: a.user?.telefono ?? "",
          servicio: a.service?.name ?? "",
          precio: a.servicePrice ?? a.service?.price ?? 0,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-16 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="minimal-input max-w-xs"
          >
            <option value="all">Todos los meses</option>
            {availableMonths.map((m) => {
              const [y, mo] = m.split("-");
              return (
                <option key={m} value={m}>
                  {new Date(Number(y), Number(mo) - 1).toLocaleDateString("es", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              );
            })}
          </select>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-medium mb-3">Ingresos por servicio</h2>
          <MonthlyIncomeByServiceChart data={filtered} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Turnos" value={totalTurns.toString()} />
          <StatCard title="Ingresos" value={`$ ${incomeMonth}`} />
          <StatCard title="Hoy" value={turnsToday.toString()} />
          <StatCard title="Servicio top" value={topService} />
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl p-4 shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

          <div>
            <label className="text-xs text-gray-500">Desde</label>
            <input
              type="date"
              value={from ?? ""}
              onChange={(e) => setFrom(e.target.value || null)}
              className="minimal-input w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Hasta</label>
            <input
              type="date"
              value={to ?? ""}
              onChange={(e) => setTo(e.target.value || null)}
              className="minimal-input w-full"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="minimal-input"
          >
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <input
            placeholder="Buscar cliente, servicio o teléfono"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="minimal-input lg:col-span-2"
          />

          <button
            onClick={handleExport}
            className="bg-black text-white rounded-xl px-4 py-2"
          >
            Exportar CSV
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <TurnsTable data={filtered} loading={loading} />
        </div>
      </main>
    </div>
  );
}
