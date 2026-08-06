"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
} from "recharts";
import { incomeByMonth } from "@/lib/income";
import useIsDark from "@/lib/useIsDark";

type SparklineAppointment = {
  date: string;
  servicePrice?: number | null;
  service?: {
    price?: number;
  } | null;
  payments?: { amount: number; createdAt?: string | Date }[];
};

export default function MonthlyTrendSparkline({
  data,
}: {
  data: SparklineAppointment[];
}) {
  const isDark = useIsDark();

  const chartData = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return Array.from(incomeByMonth(data).entries())
      .filter(([key]) => key < currentKey)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3)
      .map(([_, total]) => ({ total }));
  }, [data]);

  if (chartData.length < 2) return null;

  const stroke = isDark ? "#e5e5e5" : "#111";

  return (
    <div className="w-full h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} accessibilityLayer={false}>
          <Area
            type="monotone"
            dataKey="total"
            stroke="none"
            fill={stroke}
            fillOpacity={0.08}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
