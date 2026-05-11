import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        payments: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const enrichedAppointments = appointments.map((appointment) => {
      const totalPaid = appointment.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      const remaining = (appointment.servicePrice || 0) - totalPaid;

      return {
        ...appointment,
        totalPaid,
        remaining,
      };
    });

    return NextResponse.json(enrichedAppointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      lastName,
      telefono,
      instagram,
      notes,
      date,
      serviceId,
      depositAmount,
    } = body;

    if (!date || !serviceId || !name || !lastName || !telefono) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha invalida" },
        { status: 400 }
      );
    }

    if (appointmentDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "No se puede reservar un turno en el pasado" },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: { not: "cancelled" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Horario no disponible" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const parsedDeposit = Number(depositAmount || 0);

    if (
      depositAmount &&
      (!Number.isFinite(parsedDeposit) || parsedDeposit < 0)
    ) {
      return NextResponse.json(
        { error: "Sena invalida" },
        { status: 400 }
      );
    }

    const initialStatus = parsedDeposit > 0 ? "pending" : "confirmed";

    const appointment = await prisma.appointment.create({
      data: {
        name: String(name).trim(),
        lastName: String(lastName).trim(),
        telefono: String(telefono).trim(),
        instagram: instagram ? String(instagram).trim() : null,
        notes: notes ? String(notes).trim() : null,
        date: appointmentDate,
        serviceId,
        servicePrice: Math.round(service.price),
        status: initialStatus,
      },
    });

    if (parsedDeposit > 0) {
      await prisma.payment.create({
        data: {
          amount: Math.round(parsedDeposit),
          method: "deposit",
          appointmentId: appointment.id,
        },
      });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating appointment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const body = await request.json();
  let updatedDate: Date | undefined;

  if (body.date && body.time) {
    updatedDate = new Date(`${body.date}T${body.time}:00-03:00`);

    if (Number.isNaN(updatedDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha invalida" },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        date: updatedDate,
        status: { not: "cancelled" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Horario no disponible" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      name: body.name,
      lastName: body.lastName,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      status: body.status,
      serviceId: body.serviceId,
      ...(updatedDate ? { date: updatedDate } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  await prisma.payment.deleteMany({ where: { appointmentId: id } });
  await prisma.appointment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
