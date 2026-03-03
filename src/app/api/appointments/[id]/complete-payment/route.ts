import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { payments: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const totalPaid = appointment.payments.reduce(
    (acc, p) => acc + p.amount,
    0
  );

  const remaining =
    (appointment.servicePrice ?? 0) - totalPaid;

  if (remaining <= 0) {
    return NextResponse.json({ error: "Ya está pago" }, { status: 400 });
  }

  await prisma.payment.create({
    data: {
      amount: remaining,
      method: "cash",
      appointmentId: appointment.id,
    },
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "completed" },
  });

  return NextResponse.json({ success: true });
}
