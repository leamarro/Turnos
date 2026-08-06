import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    await prisma.payment.deleteMany({
      where: {
        appointmentId: params.id,
        method: "full",
      },
    });

    await prisma.payment.deleteMany({
      where: {
        appointmentId: params.id,
        method: "pendiente",
      },
    });

    await prisma.payment.create({
      data: {
        amount: 0,
        method: "pendiente",
        appointmentId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error marcando turno como no pagado" },
      { status: 500 }
    );
  }
}
