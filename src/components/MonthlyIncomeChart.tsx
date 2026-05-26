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
    <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl shadow dark:shadow-none border dark:border-gray-800 w-full">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Ingresos por mes</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
