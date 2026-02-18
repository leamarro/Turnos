import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ========================= */
/* GET */
/* ========================= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
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

  const appointments = await prisma.appointment.findMany({
    include: { service: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(appointments);
}

/* ========================= */
/* PUT */
/* ========================= */
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      name,
      lastName,
      telefono,
      instagram,
      notes, // ✅ IMPORTANTE
      serviceId,
      status,
      date,
      time,
    } = body;

    let finalDate: Date | undefined = undefined;

    if (date && time) {
      finalDate = new Date(`${date}T${time}`);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        name,
        lastName,
        telefono,
        instagram,
        notes, // ✅ ACA SE GUARDA
        serviceId: serviceId || null,
        status,
        ...(finalDate && { date: finalDate }),
      },
      include: { service: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar turno" },
      { status: 500 }
    );
  }
}

/* ========================= */
/* DELETE */
/* ========================= */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Falta ID" },
      { status: 400 }
    );
  }

  await prisma.appointment.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
4

/* ========================= */
/* POST */
/* ========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      lastName,
      telefono,
      instagram,
      notes,
      serviceId,
      date,
      time,
    } = body;

    if (!name || !date || !time) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const finalDate = new Date(`${date}T${time}`);

    const appointment = await prisma.appointment.create({
      data: {
        name,
        lastName,
        telefono,
        instagram,
        notes,
        serviceId: serviceId || null,
        status: "pending",
        date: finalDate,
      },
      include: { service: true },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    );
  }
}
