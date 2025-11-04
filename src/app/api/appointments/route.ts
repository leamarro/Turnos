import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateAppointment = z.object({
  user: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  service: z.object({
    name: z.string(),
  }),
  date: z.string(),
  notes: z.string().optional(),
});

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { user: true, service: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateAppointment.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { user, service, date, notes } = parsed.data;

  // ✅ 1. Buscar o crear usuario
  const existingUser = await prisma.user.findFirst({
    where: { phone: user.phone },
  });

  const userRecord = existingUser
    ? existingUser
    : await prisma.user.create({
        data: { name: user.name, phone: user.phone, email: "" },
      });

  // ✅ 2. Buscar servicio por nombre
  const serviceRecord = await prisma.service.findFirst({
    where: { name: service.name },
  });

  if (!serviceRecord) {
    return NextResponse.json(
      { error: "Servicio no encontrado" },
      { status: 400 }
    );
  }

  // ✅ 3. Crear el turno
  const appointment = await prisma.appointment.create({
    data: {
      userId: userRecord.id,
      serviceId: serviceRecord.id,
      date: new Date(date),
      notes,
    },
    include: { user: true, service: true },
  });

  return NextResponse.json(appointment);
}
