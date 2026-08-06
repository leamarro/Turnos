"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, Cell } from "recharts";
import { formatMonthLabel } from "@/components/ChartTooltip";
import useIsDark from "@/lib/useIsDark";

type MonthEntry = { month: string; total: number };

const ACCENT = "#10b981";

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function compactMoney(v: number) {
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (v >= 1000) {
    const k = v / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(v);
}

export default function MonthlyIncomeChart({
  sinceLabel,
}: {
  sinceLabel?: string | null;
}) {
  const [data, setData] = useState<MonthEntry[]>([]);
  const isDark = useIsDark();

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetch("/api/stats/monthly-income");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    };
    loadStats();
  }, []);

  // Solo meses ya terminados (mes actual excluido), últimos 6
  const completed = data
    .filter((m) => m.month < currentMonthKey())
    .slice(-6);

  return (
    <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl shadow-sm dark:border dark:border-gray-800 w-full">
      <h2 className="text-sm font-semibold mb-1 dark:text-white">Ingresos por mes</h2>
      <p className="text-xs text-gray-400 mb-4">
        Meses cerrados{sinceLabel ? ` · desde ${sinceLabel}` : ""}
      </p>

      {completed.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
          Todavía no hay meses cerrados
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completed} margin={{ top: 20, right: 4, left: 4, bottom: 0 }} accessibilityLayer={false}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                interval={0}
                tickFormatter={formatMonthLabel}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={44} activeBar={false}>
                {completed.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === completed.length - 1 ? ACCENT : isDark ? "#e5e7eb" : "#111827"}
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(v: unknown) => compactMoney(Number(v))}
                  fill={isDark ? "#d1d5db" : "#6b7280"}
                  fontSize={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
