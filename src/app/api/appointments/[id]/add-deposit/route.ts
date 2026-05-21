import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const method = body.method || "Efectivo";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Monto invalido" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        servicePrice: true,
        payments: { select: { amount: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    const totalPagado = appointment.payments.reduce(
      (acc, p) => acc + p.amount,
      0
    );

    if (totalPagado >= appointment.servicePrice) {
      return NextResponse.json(
        { error: "El turno ya está completamente pagado" },
        { status: 400 }
      );
    }

    await prisma.payment.create({
      data: {
        amount,
        method,
        appointmentId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error agregando pago" },
      { status: 500 }
    );
  }
}
