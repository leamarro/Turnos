"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyIncomeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetch("/api/stats/monthly-income");
      const json = await res.json();
      setData(json);
    };
    loadStats();
  }, []);

  return (
    <div className="bg-white dark:bg-[#252525] p-5 rounded-2xl shadow-sm dark:border dark:border-gray-800 w-full">
      <h2 className="text-sm font-semibold mb-4 dark:text-white">Ingresos por mes</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 13 }}
              formatter={(value) => typeof value === "number" ? [`$${value.toLocaleString("es-AR")}`, "Ingresos"] : value}
            />
            <Bar dataKey="total" fill="#111827" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
