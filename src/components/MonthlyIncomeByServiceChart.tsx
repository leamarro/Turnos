"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyIncomeByServiceChart() {
  const [data, setData] = useState<any[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const COLORS = ["#3B82F6", "#EF4444", "#22C55E", "#F59E0B", "#10B981"];

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/analytics/income-by-service");
      const d = await res.json();

      // 🔥 Si d NO es array → convertirlo
      const arr = Array.isArray(d)
        ? d
        : Object.entries(d).map(([month, values]: any) => ({
            month,
            ...values,
          }));

      setData(arr);

      // Extraer servicios dinámicamente
      const keys = new Set<string>();
      arr.forEach((row: any) => {
        Object.keys(row).forEach((k) => {
          if (k !== "month") keys.add(k);
        });
      });

      setServices([...keys]);
    };

    load();
  }, []);

  return (
    <div className="w-full h-[350px] sm:h-[400px] md:h-[450px]">
      <ResponsiveContainer>
        <BarChart data={data} barSize={30}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

          {services.map((service, i) => (
            <Bar
              key={service}
              dataKey={service}
              fill={COLORS[i % COLORS.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
