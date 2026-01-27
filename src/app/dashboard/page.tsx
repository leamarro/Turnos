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

  // filtros dashboard
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // filtros export
  const [exportMonth, setExportMonth] = useState("all");
  const [exportService, setExportService] = useState("all");

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/appointments", { cache: "no-store" });
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // =========================
  // FILTROS DASHBOARD
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
  // FILTROS EXPORT
  // =========================
  const exportData = useMemo(() => {
    return appointments.filter((a) => {
      const d = new Date(a.date);

      if (exportMonth !== "all") {
        const [y, m] = exportMonth.split("-").map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }

      if (exportService !== "all" && a.service?.id !== exportService)
        return false;

      return true;
    });
  }, [appointments, exportMonth, exportService]);

  // =========================
  // MÉTRICAS
  // =========================
  const incomeMonth = filtered.reduce(
    (sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0),
    0
  );

  const topService =
    filtered
      .reduce<Record<string, number>>((acc, a) => {
        const name = a.service?.name ?? "Sin servicio";
        acc[name] = (acc[name] ?? 0) + 1;
        return acc;
      }, {})
      |> Object.entries(#).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // =========================
  // OPCIONES
  // =========================
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.date);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
    });
    return [...set];
  }, [appointments]);

  const services = useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((a) => {
      if (a.service) map.set(a.service.id, a.service.name);
    });
    return [...map.entries()];
  }, [appointments]);

  // =========================
  // EXPORT CSV
  // =========================
  const handleExport = () => {
    const nameParts = [
      "turnos",
      exportMonth !== "all" ? exportMonth : null,
      exportService !== "all"
        ? services.find(([id]) => id === exportService)?.[1]
        : null,
    ].filter(Boolean);

    exportToCsv(
      `${nameParts.join("-")}.csv`,
      exportData.map((a) => {
        const d = new Date(a.date);
        return {
          fecha: d.toLocaleDateString(),
          hora: d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
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

        {/* GRÁFICO */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h2 className="font-medium mb-3">Ingresos por servicio</h2>
          <MonthlyIncomeByServiceChart data={filtered} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Turnos" value={filtered.length.toString()} />
          <StatCard title="Ingresos" value={`$ ${incomeMonth}`} />
          <StatCard title="Servicio top" value={topService} />
        </div>

        {/* EXPORT */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-3">
          <h3 className="font-medium">Exportar CSV</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="minimal-input"
            >
              <option value="all">Todos los meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={exportService}
              onChange={(e) => setExportService(e.target.value)}
              className="minimal-input"
            >
              <option value="all">Todos los servicios</option>
              {services.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="bg-black text-white rounded-xl px-4 py-2"
            >
              Exportar CSV
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Se exportarán {exportData.length} turnos
          </p>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <TurnsTable data={filtered} loading={loading} />
        </div>
      </main>
    </div>
  );
}
