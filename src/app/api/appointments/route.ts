import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ========================= */
/* GET — lista o detalle */
/* ========================= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      include: { service: true },
    });

    return NextResponse.json(appointments);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Turno no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(appointment);
}

/* ========================= */
/* POST */
/* ========================= */
export async function POST(request: Request) {
  const body = await request.json();

  const appointment = await prisma.appointment.create({
    data: {
      name: body.name,
      lastName: body.lastName,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      date: new Date(body.date),
      status: body.status ?? "pending",
      serviceId: body.serviceId,
    },
  });

  return NextResponse.json(appointment);
}

/* ========================= */
/* PUT */
/* ========================= */
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID requerido" },
      { status: 400 }
    );
  }

  const body = await request.json();

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      name: body.name,
      lastName: body.lastName,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      status: body.status,
      serviceId: body.serviceId,
      ...(body.date && body.time
        ? {
            date: new Date(
              `${body.date}T${body.time}:00-03:00`
            ),
          }
        : {}),
    },
  });

  return NextResponse.json(updated);
}

/* ========================= */
/* DELETE */
/* ========================= */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID requerido" },
      { status: 400 }
    );
  }

  await prisma.appointment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}