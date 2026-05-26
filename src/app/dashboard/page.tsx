"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth, endOfMonth, subMonths, isWithinInterval,
  startOfWeek, endOfWeek, subWeeks,
} from "date-fns";
import TodaySummaryCard from "@/components/TodaySummaryCard";
import TodayNextAppointments from "@/components/TodayNextAppointments";
import TodayAlertCard from "@/components/TodayAlertCard";
import MonthlyIncomeChart from "@/components/MonthlyIncomeChart";
import MonthlyIncomeByServiceChart from "@/components/MonthlyIncomeByServiceChart";
import MonthlyTrendSparkline from "@/components/MonthlyTrendSparkline";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Appointment = any;

const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
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

  const income = (list: Appointment[]) =>
    list.reduce((sum, a) => sum + (a.servicePrice ?? a.service?.price ?? 0), 0);

  const currentMonthData = appointments.filter((a) => isWithinInterval(new Date(a.date), currentMonth));
  const prevMonthData = appointments.filter((a) => isWithinInterval(new Date(a.date), prevMonth));
  const thisWeekData = appointments.filter((a) => isWithinInterval(new Date(a.date), thisWeek));
  const lastWeekData = appointments.filter((a) => isWithinInterval(new Date(a.date), lastWeek));

  const incomeCurrent = income(currentMonthData);
  const incomePrev = income(prevMonthData);

  const monthVariation = incomePrev === 0 ? null : ((incomeCurrent - incomePrev) / incomePrev) * 100;
  const weekVariation = lastWeekData.length === 0 ? null : ((thisWeekData.length - lastWeekData.length) / lastWeekData.length) * 100;

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => {
      const name = `${a.name ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [appointments]);

  if (loading) {
    return <p className="p-6 text-sm text-gray-500 dark:text-gray-400">Cargando dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] px-4 pt-4 pb-6">
      <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{appointments.length} turnos totales</p>
      </div>

      {/* HOY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TodaySummaryCard appointments={appointments} />
        <TodayNextAppointments appointments={appointments} />
        <TodayAlertCard appointments={appointments} />
      </div>

      {/* CARD PRINCIPAL — ingresos */}
      <div className="bg-black text-white rounded-2xl p-5">
        <p className="text-xs text-white/60 uppercase tracking-wide">Ingresos del mes</p>
        <p className="text-4xl font-bold mt-1">{money(incomeCurrent)}</p>
        <p className="text-xs mt-2 text-white/50">
          {monthVariation === null
            ? "Sin datos del mes anterior"
            : `${monthVariation > 0 ? "↑" : "↓"} ${Math.abs(monthVariation).toFixed(1)}% vs mes anterior`}
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <p className="text-xs text-gray-400">Turnos este mes</p>
          <p className="text-3xl font-bold mt-1 dark:text-white">{currentMonthData.length}</p>
          <p className="text-xs mt-1 text-gray-400">
            {prevMonthData.length === 0 ? "Sin mes previo"
              : `${currentMonthData.length > prevMonthData.length ? "↑" : "↓"} ${Math.abs(
                  ((currentMonthData.length - prevMonthData.length) / prevMonthData.length) * 100
                ).toFixed(0)}% vs mes anterior`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <p className="text-xs text-gray-400">Esta semana</p>
          <p className="text-3xl font-bold mt-1 dark:text-white">{thisWeekData.length}</p>
          <p className="text-xs mt-1 text-gray-400">
            {weekVariation === null ? "Sin semana previa"
              : `${weekVariation > 0 ? "↑" : "↓"} ${Math.abs(weekVariation).toFixed(0)}% vs semana ant.`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <p className="text-xs text-gray-400">Semana anterior</p>
          <p className="text-3xl font-bold mt-1 dark:text-white">{lastWeekData.length}</p>
          <p className="text-xs mt-1 text-gray-400">{(lastWeekData.length / 7).toFixed(1)} turnos / día</p>
        </div>
        <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
          <p className="text-xs text-gray-400">Total histórico</p>
          <p className="text-3xl font-bold mt-1 dark:text-white">{appointments.length}</p>
          <p className="text-xs mt-1 text-gray-400">turnos registrados</p>
        </div>
      </div>

      {/* CLIENTES FRECUENTES */}
      <div className="bg-white dark:bg-[#252525] rounded-2xl p-4 shadow-sm dark:border dark:border-gray-800">
        <p className="text-sm font-semibold mb-3 dark:text-white">Clientes frecuentes</p>
        {topClients.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos</p>
        ) : (
          <div className="space-y-3">
            {topClients.map(([clientName, count], i) => (
              <div key={clientName} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm dark:text-gray-200">{clientName}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white">{count} turnos</span>
              </div>
            ))}
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

      </div>
    </div>
  );
}
