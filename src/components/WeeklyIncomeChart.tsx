"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  appointments: any[];
};

export default function WeeklyIncomeChart({ appointments }: Props) {
  const week = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const data = week.map((day, i) => {
    const total = appointments.reduce((sum, a) => {
      const d = new Date(a.date);
      if (d.getDay() === i) {
        return sum + (a.servicePrice ?? a.service?.price ?? 0);
      }
      return sum;
    }, 0);

    return { day, total };
  });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
