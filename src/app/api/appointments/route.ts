import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ========================= */
/* GET — lista o detalle */
/* ========================= */
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
    })

    const enrichedAppointments = appointments.map((appointment) => {
      const totalPaid = appointment.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      )

      const remaining =
        (appointment.servicePrice || 0) - totalPaid

      return {
        ...appointment,
        totalPaid,
        remaining,
      }
    })

    return NextResponse.json(enrichedAppointments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error fetching appointments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      lastName,
      telefono,
      instagram,
      notes,
      date,
      serviceId,
      depositAmount,
    } = body

    if (!date || !serviceId || !name) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      )
    }

    const appointmentDate = new Date(date)

    // 🔥 Validar horario ocupado
    const existing = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: { not: "cancelled" },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Horario no disponible" },
        { status: 400 }
      )
    }

    // 🔥 Buscar precio real del servicio
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      )
    }

    // 🔥 Estado inicial automático
    let initialStatus: "confirmed" | "pending" = "confirmed"

    if (depositAmount && Number(depositAmount) > 0) {
      initialStatus = "pending"
    }

    const appointment = await prisma.appointment.create({
      data: {
        name,
        lastName,
        telefono,
        instagram,
        notes,
        date: appointmentDate,
        serviceId,
        servicePrice: service.price, // 🔥 ahora sale del servicio
        status: initialStatus,
      },
    })

    // 🔥 Crear seña si existe
    if (depositAmount && Number(depositAmount) > 0) {
      await prisma.payment.create({
        data: {
          amount: Number(depositAmount),
          method: "deposit",
          appointmentId: appointment.id,
        },
      })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error creating appointment" },
      { status: 500 }
    )
  }
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