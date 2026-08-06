"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { incomeByMonth } from "@/lib/income";

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
  const chartData = useMemo(() => {
    const map = incomeByMonth(data);

    return Array.from(map.entries())
      .sort((a, b) => {
        const [ay, am] = a[0].split("-").map(Number);
        const [by, bm] = b[0].split("-").map(Number);
        return ay !== by ? ay - by : am - bm;
      })
      .slice(-3)
      .map(([_, total]) => ({ total }));
  }, [data]);

  if (chartData.length < 2) return null;

  return (
    <div className="w-full h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="total"
            stroke="#000"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
