import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// GET — obtener turnos
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");

    // 👉 obtener un turno puntual
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

    // 👉 listar turnos (opcional por fecha)
    const appointments = await prisma.appointment.findMany({
      where: date
        ? {
            date: {
              gte: new Date(`${date}T00:00:00`),
              lte: new Date(`${date}T23:59:59`),
            },
          }
        : {},
      include: { service: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error cargando turnos" },
      { status: 500 }
    );
  }
}

// =========================
// POST — crear turno
// =========================
export async function POST(req: Request) {
  try {
    const {
      name,
      lastName,
      telefono,
      instagram,
      serviceId,
      date,
      status,
    } = await req.json();

    if (!name || !lastName || !telefono || !serviceId || !date) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        name,
        lastName,
        telefono,
        instagram: instagram || null, // 👈 guarda @usuario o null
        serviceId,
        date: new Date(date),
        status: status ?? "pendiente",
      },
      include: { service: true },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creando turno:", error);
    return NextResponse.json(
      { error: "Error interno" },
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
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data: any = {
      name: body.name,
      lastName: body.lastName,
      telefono: body.telefono,
      instagram: body.instagram ?? null,
      serviceId: body.serviceId,
      status: body.status,
    };

    if (body.date && body.time) {
      data.date = new Date(`${body.date}T${body.time}`);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: { service: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo actualizar el turno" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Turno eliminado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo eliminar el turno" },
      { status: 500 }
    );
  }
}
