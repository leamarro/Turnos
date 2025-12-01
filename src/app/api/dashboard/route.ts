import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ================================
    // FACTURACIÓN POR MES
    // ================================
    const revenueByMonthRaw = await prisma.appointment.findMany({
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    const revenueByMonth = revenueByMonthRaw.reduce((acc, appt) => {
      const monthKey = `${appt.date.getFullYear()}-${appt.date.getMonth() + 1}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, count: 0 };
      }

      acc[monthKey].total += appt.service?.price ?? 0;
      acc[monthKey].count += 1;

      return acc;
    }, {} as Record<string, { total: number; count: number }>);


    // ================================
    // FACTURACIÓN POR DÍA
    // ================================
    const revenueByDay = revenueByMonthRaw.reduce((acc, appt) => {
      const dayKey = appt.date.toISOString().split("T")[0];

      if (!acc[dayKey]) {
        acc[dayKey] = { total: 0, count: 0 };
      }

      acc[dayKey].total += appt.service?.price ?? 0;
      acc[dayKey].count += 1;

      return acc;
    }, {} as Record<string, { total: number; count: number }>);


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
