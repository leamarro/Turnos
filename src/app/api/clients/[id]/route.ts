import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const identifier = decodeURIComponent(params.id);

  const appointments = await prisma.appointment.findMany({
    where: { OR: [{ telefono: identifier }, { instagram: identifier }] },
    select: { id: true },
  });

  const ids = appointments.map((a) => a.id);

  await prisma.payment.deleteMany({ where: { appointmentId: { in: ids } } });
  await prisma.appointment.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const identifier = decodeURIComponent(params.id);

  // 🔍 buscamos turnos por teléfono O instagram
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { telefono: identifier },
        { instagram: identifier },
      ],
    },
    orderBy: { date: "desc" },
    include: {
      service: true,
    },
  });

  if (appointments.length === 0) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 }
    );
  }

  const first = appointments[0];

  return NextResponse.json({
    name: first.name ?? "",
    lastName: first.lastName ?? "",
    telefono: first.telefono ?? null,
    instagram: first.instagram ?? null,
    appointments: appointments.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status,
      service: a.service,
    })),
  });
}
