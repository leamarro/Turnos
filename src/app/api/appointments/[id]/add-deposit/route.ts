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

    await prisma.payment.create({
      data: {
        amount: parsedAmount,
        method: "deposit",
        appointmentId: params.id,
      },
    });

    const updated = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    const totalPagado =
      updated?.payments.reduce((acc, p) => acc + p.amount, 0) ?? 0;

    const totalServicio = updated?.servicePrice ?? 0;

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
