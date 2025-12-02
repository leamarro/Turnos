import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// GET — obtener turno(s)
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");

    if (id) {
      // Obtener turno por ID
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { user: true, service: true },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Turno no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(appointment, { status: 200 });
    }

    // Obtener todos los turnos (opcional por fecha)
    const appointments = await prisma.appointment.findMany({
      where: date
        ? {
            date: {
              gte: new Date(date + "T00:00:00"),
              lte: new Date(date + "T23:59:59"),
            },
          }
        : {},
      include: { user: true, service: true },
      orderBy: { date: "asc" },
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
// PUT — actualizar turno
// =========================
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, telefono, serviceId, date, time, status } = body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    // Actualizar usuario
    if (existingAppointment.userId) {
      await prisma.user.update({
        where: { id: existingAppointment.userId },
        data: { name, telefono },
      });
    }

    // Combinar fecha y hora
    const dateTime = new Date(`${date}T${time}`);

    // Actualizar cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: dateTime,
        serviceId,
        status,
      },
      include: { user: true, service: true },
    });

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR UPDATE APPOINTMENT:", error);
    return NextResponse.json({ error: "No se pudo actualizar el turno" }, { status: 500 });
  }
}

// =========================
// DELETE — eliminar turno
// =========================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ message: "Turno eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR DELETE APPOINTMENT:", error);
    return NextResponse.json({ error: "No se pudo eliminar el turno" }, { status: 500 });
  }
}
