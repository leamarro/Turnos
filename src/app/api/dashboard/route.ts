import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ================================
    // FACTURACIÓN POR MES y POR DÍA
    // ================================
    const appointments = await prisma.appointment.findMany({
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    const revenueByMonth: Record<string, { total: number; count: number }> = {};
    const revenueByDay: Record<string, { total: number; count: number }> = {};

    appointments.forEach((appt) => {
      const price = appt.service?.price ?? 0;

      // ---- MES ----
      const monthKey = `${appt.date.getFullYear()}-${appt.date.getMonth() + 1}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { total: 0, count: 0 };
      }
      revenueByMonth[monthKey].total += price;
      revenueByMonth[monthKey].count += 1;

      // ---- DÍA ----
      const dayKey = appt.date.toISOString().split("T")[0];
      if (!revenueByDay[dayKey]) {
        revenueByDay[dayKey] = { total: 0, count: 0 };
      }
      revenueByDay[dayKey].total += price;
      revenueByDay[dayKey].count += 1;
    });

    // ================================
    // FACTURACIÓN POR SERVICIO
    // ================================
    const services = await prisma.service.findMany({
      include: {
        appointments: true,
      },
    });

    const revenueByService = services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      totalIncome: service.appointments.length * service.price,
      count: service.appointments.length,
    }));

    return NextResponse.json({
      revenueByMonth,
      revenueByDay,
      revenueByService,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    return NextResponse.json(
      { error: "Error al cargar el dashboard" },
      { status: 500 }
    );
  }
}
