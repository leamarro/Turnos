"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip, { formatMonthLabel } from "@/components/ChartTooltip";
import useIsDark from "@/lib/useIsDark";

export default function MonthlyIncomeChart({
  sinceLabel,
}: {
  sinceLabel?: string | null;
}) {
  const [data, setData] = useState<{ month: string; total: number }[]>([]);
  const isDark = useIsDark();

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetch("/api/stats/monthly-income");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    };
    loadStats();
  }, []);

  return (
    <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl shadow-sm dark:border dark:border-gray-800 w-full">
      <h2 className="text-sm font-semibold mb-1 dark:text-white">Ingresos por mes</h2>
      {sinceLabel && (
        <p className="text-xs text-gray-400 mb-4">desde {sinceLabel}</p>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              interval="preserveStartEnd"
              tickFormatter={formatMonthLabel}
            />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" width={56} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
            <Tooltip
              content={<ChartTooltip labelFormatter={formatMonthLabel} />}
              cursor={false}
            />
            <Bar dataKey="total" fill={isDark ? "#e5e7eb" : "#111827"} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
