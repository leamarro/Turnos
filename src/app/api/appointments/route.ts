import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// GET — obtener todos los turnos
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const appointments = await prisma.appointment.findMany({
      where: date
        ? {
            date: {
              gte: new Date(date + "T00:00:00"),
              lte: new Date(date + "T23:59:59"),
            },
          }
        : {},
      include: {
        service: true,
        user: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR GET APPOINTMENTS:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los turnos" },
      { status: 500 }
    );
  }
}

// =========================
// POST — crear turno nuevo
// =========================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, serviceId, name, telefono } = body;

    if (!date || !serviceId || !name || !telefono) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "El servicio no existe" },
        { status: 404 }
      );
    }

    // Crear u obtener usuario
    const user = await prisma.user.upsert({
      where: { telefono },
      update: { name },
      create: { name, telefono },
    });

    // Crear turno
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        serviceId,
        userId: user.id,
        // ❌ eliminado: servicePrice
        // ahora el precio se consulta desde service.price
      },
      include: {
        user: true,
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("❌ ERROR CREATE APPOINTMENT:", error);

    return NextResponse.json(
      { error: "No se pudo crear el turno" },
      { status: 500 }
    );
  }
}
