import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, date, serviceId } = body;

    if (!name || !email || !date || !serviceId) {
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
    return NextResponse.json({ error: "Error al crear turno" }, { status: 500 });
  }
}
