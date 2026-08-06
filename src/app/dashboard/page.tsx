"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth, endOfMonth, subMonths, isWithinInterval,
  startOfWeek, endOfWeek, subWeeks,
} from "date-fns";
import { Download, Calendar, DollarSign, Users, BarChart2, TrendingUp } from "lucide-react";
import TodaySummaryCard from "@/components/TodaySummaryCard";
import TodayNextAppointments from "@/components/TodayNextAppointments";
import TodayAlertCard from "@/components/TodayAlertCard";
import MonthlyIncomeChart from "@/components/MonthlyIncomeChart";
import MonthlyIncomeByServiceChart from "@/components/MonthlyIncomeByServiceChart";
import MonthlyTrendSparkline from "@/components/MonthlyTrendSparkline";
import { incomeInInterval } from "@/lib/income";
import IncomeModal from "@/components/IncomeModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Appointment = any;

const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncome, setShowIncome] = useState(false);
  const [clientMap, setClientMap] = useState<Map<string, string>>(new Map());
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const [apptRes, clientRes] = await Promise.all([
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/clients", { cache: "no-store" }),
      ]);
      const apptData = await apptRes.json();
      setAppointments(Array.isArray(apptData) ? apptData : []);

      const clientData = await clientRes.json();
      if (Array.isArray(clientData)) {
        const map = new Map<string, string>();
        clientData.forEach((c: any) => {
          const key = `${c.name} ${c.lastName ?? ""}`.trim().toLowerCase();
          if (key) map.set(key, c.id);
        });
        setClientMap(map);
      }

      setLoading(false);
    };
    load();
  }, []);

  const now = new Date();

  const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const prevMonthDate = subMonths(now, 1);
  const prevMonth = { start: startOfMonth(prevMonthDate), end: endOfMonth(prevMonthDate) };
  const thisWeek = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  const lastWeekDate = subWeeks(now, 1);
  const lastWeek = { start: startOfWeek(lastWeekDate, { weekStartsOn: 1 }), end: endOfWeek(lastWeekDate, { weekStartsOn: 1 }) };

  const currentMonthData = appointments.filter((a) => isWithinInterval(new Date(a.date), currentMonth));
  const prevMonthData = appointments.filter((a) => isWithinInterval(new Date(a.date), prevMonth));
  const thisWeekData = appointments.filter((a) => isWithinInterval(new Date(a.date), thisWeek));
  const lastWeekData = appointments.filter((a) => isWithinInterval(new Date(a.date), lastWeek));

  const incomeCurrent = incomeInInterval(appointments, currentMonth.start, currentMonth.end);
  const incomePrev = incomeInInterval(appointments, prevMonth.start, prevMonth.end);

  const monthVariation = incomePrev === 0 ? null : ((incomeCurrent - incomePrev) / incomePrev) * 100;
  const weekVariation = lastWeekData.length === 0 ? null : ((thisWeekData.length - lastWeekData.length) / lastWeekData.length) * 100;

  const daysInMonth = endOfMonth(now).getDate();
  const daysElapsed = now.getDate();
  const monthProgress = (daysElapsed / daysInMonth) * 100;
  const dailyAvg = daysElapsed > 0 ? incomeCurrent / daysElapsed : 0;
  const projected = dailyAvg > 0 ? Math.round(dailyAvg * daysInMonth) : 0;

  const agendado = appointments.reduce((sum, a) => {
    const d = new Date(a.date);
    if (!isWithinInterval(d, currentMonth) || d < now) return sum;
    const total = a.service?.price ?? a.servicePrice ?? 0;
    const paid = a.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0;
    return sum + Math.max(total - paid, 0);
  }, 0);

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [appointments]);

  function exportCSV() {
    const rows = [["Fecha", "Hora", "Cliente", "Servicio", "Precio", "Pagado", "Restante"]];
    appointments.forEach((a: any) => {
      const d = new Date(a.date);
      const total = a.service?.price ?? a.servicePrice ?? 0;
      const paid = a.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0;
      rows.push([
        d.toLocaleDateString("es-AR"),
        d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        `${a.name ?? ""} ${a.lastName ?? ""}`.trim(),
        a.service?.name ?? "",
        String(total),
        String(paid),
        String(total - paid),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turnos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] px-4 pt-4 pb-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-36 bg-gray-200 dark:bg-[#333] rounded-lg" />
            <div className="h-7 w-28 bg-gray-200 dark:bg-[#333] rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-24 shadow-sm dark:border dark:border-gray-800" />
            ))}
          </div>
          <div className="bg-gray-200 dark:bg-[#333] rounded-2xl h-32" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-28 shadow-sm dark:border dark:border-gray-800" />
            ))}
          </div>
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-32 shadow-sm dark:border dark:border-gray-800" />
          <div className="h-6 w-40 bg-gray-200 dark:bg-[#333] rounded-lg" />
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-48 shadow-sm dark:border dark:border-gray-800" />
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-48 shadow-sm dark:border dark:border-gray-800" />
          <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 h-48 shadow-sm dark:border dark:border-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] px-4 pt-4 pb-6">
      <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#252525] transition"
          >
            <Download size={13} />
            Exportar CSV
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">{appointments.length} turnos</p>
        </div>
      </div>

      {/* CARD PRINCIPAL — ingresos */}
      <button
        onClick={() => setShowIncome(true)}
        className="w-full text-left bg-black text-white rounded-2xl p-5 overflow-hidden relative active:opacity-90 transition"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/60 uppercase tracking-wide">Ingresos del mes</p>
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">
              día {daysElapsed}/{daysInMonth}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-white/50 uppercase tracking-wide">Cobrado</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{money(incomeCurrent)}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-white/50 uppercase tracking-wide">Agendado</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{money(agendado)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
            {monthVariation !== null && (
              <span className={monthVariation > 0 ? "text-emerald-400" : "text-red-400"}>
                {monthVariation > 0 ? "↑" : "↓"} {Math.abs(monthVariation).toFixed(1)}% vs mes ant.
              </span>
            )}
            <span>~{money(Math.round(dailyAvg))} / día</span>
          </div>
          {projected > 0 && (
            <p className="text-[11px] text-white/40 mt-2">
              Proyección → {money(projected)}
            </p>
          )}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(monthProgress, 100)}%` }}
            />
          </div>
        </div>
      </button>

      {/* HOY */}
      <TodaySummaryCard appointments={appointments} />

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/admin")}
          className="text-left bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800 active:scale-[0.98] transition"
        >
          <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center mb-2">
            <Calendar size={15} className="text-black dark:text-white" />
          </div>
          <p className="text-xs text-gray-400">Turnos este mes</p>
          <p className="text-3xl font-bold mt-0.5 dark:text-white">{currentMonthData.length}</p>
          <p className="text-xs mt-1 text-gray-400">
            {prevMonthData.length === 0 ? "Sin mes previo"
              : `${currentMonthData.length > prevMonthData.length ? "↑" : "↓"} ${Math.abs(
                  ((currentMonthData.length - prevMonthData.length) / prevMonthData.length) * 100
                ).toFixed(0)}% vs mes anterior`}
          </p>
        </button>
        <button
          onClick={() => router.push("/admin")}
          className="text-left bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800 active:scale-[0.98] transition"
        >
          <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center mb-2">
            <BarChart2 size={15} className="text-black dark:text-white" />
          </div>
          <p className="text-xs text-gray-400">Esta semana</p>
          <p className="text-3xl font-bold mt-0.5 dark:text-white">{thisWeekData.length}</p>
          <p className="text-xs mt-1 text-gray-400">
            {weekVariation === null ? "Sin semana previa"
              : `${weekVariation > 0 ? "↑" : "↓"} ${Math.abs(weekVariation).toFixed(0)}% vs semana ant.`}
          </p>
        </button>
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={15} className="text-black dark:text-white" />
          </div>
          <p className="text-xs text-gray-400">Semana anterior</p>
          <p className="text-3xl font-bold mt-0.5 dark:text-white">{lastWeekData.length}</p>
          <p className="text-xs mt-1 text-gray-400">{(lastWeekData.length / 7).toFixed(1)} turnos / día</p>
        </div>
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center mb-2">
            <DollarSign size={15} className="text-black dark:text-white" />
          </div>
          <p className="text-xs text-gray-400">Total histórico</p>
          <p className="text-3xl font-bold mt-0.5 dark:text-white">{appointments.length}</p>
          <p className="text-xs mt-1 text-gray-400">turnos registrados</p>
        </div>
      </div>

      {/* CLIENTES FRECUENTES */}
      <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-gray-400" />
          <p className="text-sm font-semibold dark:text-white">Clientes frecuentes</p>
        </div>
        {topClients.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos</p>
        ) : (
          <div className="space-y-3">
            {topClients.map(([clientName, count], i) => {
              const clientId = clientMap.get(clientName.toLowerCase());
              return (
                <button
                  key={clientName}
                  onClick={() => clientId && router.push(`/clients/${clientId}`)}
                  disabled={!clientId}
                  className="w-full flex justify-between items-center active:bg-gray-50 dark:active:bg-[#2a2a2a] rounded-xl px-1 py-1.5 transition disabled:opacity-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                      i === 1 ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300" :
                      i === 2 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm dark:text-gray-200">{clientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold dark:text-white">{count}</span>
                    <span className="text-[10px] text-gray-400">turnos</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* GRÁFICOS MENSUALES */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Evolución mensual</h2>
        <MonthlyTrendSparkline data={appointments} />
        <MonthlyIncomeChart />
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <p className="text-sm font-semibold mb-3 dark:text-white">Ingresos por servicio</p>
          <MonthlyIncomeByServiceChart data={appointments} />
        </div>
      </div>

      {/* PRÓXIMOS TURNOS HOY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TodayNextAppointments appointments={appointments} />
        <TodayAlertCard appointments={appointments} />
      </div>

      </div>

      <IncomeModal
        appointments={appointments}
        open={showIncome}
        onClose={() => setShowIncome(false)}
      />
    </div>
  );
}
