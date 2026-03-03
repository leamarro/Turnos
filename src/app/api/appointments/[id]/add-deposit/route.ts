import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { amount } = await req.json();

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

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

    // ✅ Crear pago con method obligatorio
    await prisma.payment.create({
      data: {
        amount: parsedAmount,
        method: "deposit", // 🔥 obligatorio
        appointmentId: params.id,
      },
    });

    // Recalcular totales
    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    const totalPagado =
      updatedAppointment?.payments.reduce(
        (acc, p) => acc + p.amount,
        0
      ) ?? 0;

    const totalServicio = updatedAppointment?.servicePrice ?? 0;

    // Si ya está pago → cambiar status
    if (totalPagado >= totalServicio) {
      await prisma.appointment.update({
        where: { id: params.id },
        data: { status: "completed" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al agregar seña" },
      { status: 500 }
    );
  }
}
