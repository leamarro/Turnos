import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ================================
    // FACTURACIÓN POR MES y POR DÍA
    // ================================
    const payments = await prisma.payment.findMany();

    const revenueByMonth: Record<string, { total: number; count: number }> = {};
    const revenueByDay: Record<string, { total: number; count: number }> = {};

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);

      // ---- MES ----
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { total: 0, count: 0 };
      }
      revenueByMonth[monthKey].total += payment.amount;
      revenueByMonth[monthKey].count += 1;

      // ---- DÍA ----
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!revenueByDay[dayKey]) {
        revenueByDay[dayKey] = { total: 0, count: 0 };
      }
      revenueByDay[dayKey].total += payment.amount;
      revenueByDay[dayKey].count += 1;
    });

    // ================================
    // FACTURACIÓN POR SERVICIO
    // ================================
    const services = await prisma.service.findMany({
      include: {
        appointments: { include: { payments: true } },
      },
    });

    const revenueByService = services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      totalIncome: service.appointments.reduce(
        (sum, a) =>
          sum + a.payments.reduce((acc, p) => acc + p.amount, 0),
        0
      ),
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
