import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      select: {
        date: true,
        service: {
          select: { price: true },
        },
      },
    });

    const monthly: Record<string, number> = {};

    appointments.forEach((a) => {
      const month = new Date(a.date).toISOString().slice(0, 7);
      const price = a.service?.price ?? 0;

      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += price;
    });

    const result = Object.entries(monthly).map(([month, total]) => ({
      month,
      total,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("ERROR STATS:", error);
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    );
  }
}
