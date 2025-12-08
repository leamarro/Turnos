"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WeeklyTurnsChart({ appointments }: any) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const data = days.map((day, index) => {
    const count = appointments.filter((a: any) => {
      const d = new Date(a.date);
      return d.getDay() === index;
    }).length;

    return {
      day,
      turnos: count,
    };
  });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="turnos" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
