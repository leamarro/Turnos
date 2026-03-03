import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const monthly: Record<string, number> = {};

    payments.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7);

      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += p.amount;
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