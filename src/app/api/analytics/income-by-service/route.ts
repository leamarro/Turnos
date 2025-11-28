import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      select: {
        date: true,
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const result: Record<string, Record<string, number>> = {};

    appointments.forEach((a) => {
      const month = new Date(a.date).toISOString().slice(0, 7);
      const serviceName = a.service?.name ?? "Sin servicio";
      const price = a.service?.price ?? 0;

      if (!result[month]) result[month] = {};

      result[month][serviceName] =
        (result[month][serviceName] ?? 0) + price;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en income-by-service:", error);
    return NextResponse.json(
      { error: "Error obteniendo ingresos por servicio" },
      { status: 500 }
    );
  }
}
