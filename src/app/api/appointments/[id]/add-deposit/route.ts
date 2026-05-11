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
      select: { id: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
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
