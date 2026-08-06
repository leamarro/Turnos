import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        createdAt: true,
        appointment: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const result: Record<string, Record<string, number>> = {};

    payments.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7); // YYYY-MM
      const serviceName = p.appointment?.service?.name ?? "Sin servicio";

      if (!result[month]) result[month] = {};
      result[month][serviceName] = (result[month][serviceName] ?? 0) + p.amount;
    });

    // 🔥 Convertimos el objeto en un array para Recharts
    const formatted = Object.entries(result).map(([month, services]) => ({
      month,
      ...services,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error en income-by-service:", error);
    return NextResponse.json(
      { error: "Error obteniendo ingresos por servicio" },
      { status: 500 }
    );
  }
}
