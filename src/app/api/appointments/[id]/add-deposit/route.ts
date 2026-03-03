import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { amount } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  await prisma.payment.create({
    data: {
      amount,
      method: "cash",
      appointmentId: params.id,
    },
  });

  await prisma.appointment.update({
    where: { id: params.id },
    data: { status: "pending" },
  });

  return NextResponse.json({ success: true });
}
