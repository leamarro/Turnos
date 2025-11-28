import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: {
          select: { name: true },
        },
      },
      orderBy: { date: "asc" },
    });

    const result: Record<string, Record<string, number>> = {};

    appointments.forEach((a) => {
      const month = new Date(a.date).toISOString().slice(0, 7);
      const service = a.service?.name ?? "Sin servicio";
      const price = a.servicePrice ?? a.service?.price ?? 0; // ⬅️ funciona siempre

      if (!result[month]) result[month] = {};
      result[month][service] = (result[month][service] ?? 0) + price;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en income-by-service:", error);
    return NextResponse.json(
      { error: "Error obteniendo los ingresos por servicio" },
      { status: 500 }
    );
  }
}
