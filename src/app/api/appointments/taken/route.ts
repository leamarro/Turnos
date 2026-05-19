import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Devuelve los horarios ya ocupados para una fecha (Argentina UTC-3)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json([], { status: 400 });
  }

  // Medianoche Argentina (UTC-3) = 03:00 UTC del mismo día
  const start = new Date(`${date}T03:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: start, lt: end } },
    select: { date: true },
  });

  const takenTimes = appointments.map((a) => {
    // Convertir UTC a Argentina (UTC-3)
    const argMs = new Date(a.date).getTime() - 3 * 60 * 60 * 1000;
    const d = new Date(argMs);
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  });

  return NextResponse.json(takenTimes);
}
