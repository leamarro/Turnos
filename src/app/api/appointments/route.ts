import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// GET - obtener todos o uno
// =========================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { user: true, service: true },
      });
      return NextResponse.json(appointment);
    }

    const appointments = await prisma.appointment.findMany({
      include: { user: true, service: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error GET /appointments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// =========================
// POST - crear turno
// =========================
export async function POST(req: Request) {
  try {
    const { name, telefono, date, time, serviceId, status } = await req.json();

    if (!name || !telefono || !date || !time || !serviceId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Buscar usuario por teléfono
    let user = await prisma.user.findUnique({
      where: { telefono },
    });

    // Si no existe, lo creamos
    if (!user) {
      user = await prisma.user.create({
        data: { name, telefono } as any, // parche para evitar error TS
      });
    }

    const fullDate = new Date(`${date}T${time}:00`);

    const appointment = await prisma.appointment.create({
      data: {
        date: fullDate,
        serviceId,
        userId: user.id,
        status: status || "pendiente",
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error POST /appointments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// =========================
// DELETE - eliminar turno
// =========================
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID" }, { status: 400 });
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ message: "Turno eliminado" });
  } catch (error) {
    console.error("Error DELETE /appointments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// =========================
// PUT - editar turno
// =========================
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    const { name, telefono, date, time, serviceId, status } = await req.json();

    const fullDate = new Date(`${date}T${time}:00`);

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: fullDate,
        serviceId,
        status,
        user: {
          update: {
            name,
            telefono,
          } as any, // parche para evitar error TS
        },
      },
      include: { user: true, service: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error PUT /appointments:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
