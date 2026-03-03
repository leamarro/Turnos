import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    const totalPagado =
      appointment.payments.reduce(
        (acc, p) => acc + p.amount,
        0
      ) ?? 0;

    const totalServicio = appointment.servicePrice ?? 0;

    if (totalPagado < totalServicio) {
      // Agregar pago restante automáticamente
      await prisma.payment.create({
        data: {
          amount: totalServicio - totalPagado,
          appointmentId: params.id,
        },
      });
    }

    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: "completed" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al completar pago" },
      { status: 500 }
    );
  }
}
