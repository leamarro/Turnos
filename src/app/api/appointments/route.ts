import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        user: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("ERROR GET APPOINTMENTS:", error);
    return NextResponse.json({ error: "Error al cargar turnos" }, { status: 500 });
  }

  const appointments = await prisma.appointment.findMany({
    include: { user: true, service: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const { date, serviceId, name, telefono } = await request.json();

    if (!date || !serviceId || !name) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        service: {
          connect: { id: serviceId },
        },
        user: {
          create: {
            name,
            telefono,
          },
        },
      },
      include: {
        service: true,
        user: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("ERROR CREATE APPOINTMENT:", error);
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    );
  }
}
