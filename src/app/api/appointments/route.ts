import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, serviceId } = body;

    if (!date || !serviceId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        service: { connect: { id: serviceId } },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error al crear turno:", error);
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { service: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    return NextResponse.json(
      { error: "Error al obtener turnos" },
      { status: 500 }
    );
  }
}
