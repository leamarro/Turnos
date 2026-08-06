import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { autoCompletePayments } from "@/lib/autoCompletePayments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userData = body.user || body;

    let servicePrice: number | undefined;
    if (body.serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (svc) servicePrice = Math.round(svc.price);
    }

    const appointment = await prisma.appointment.create({
      data: {
        name: userData.name || null,
        lastName: userData.lastName || null,
        telefono: userData.telefono || null,
        instagram: body.instagram || null,
        notes: body.notes || null,
        serviceId: body.serviceId,
        servicePrice,
        date: new Date(body.date),
      },
    });

    if (body.depositAmount) {
      await prisma.payment.create({
        data: {
          amount: Number(body.depositAmount),
          method: "Efectivo",
          appointmentId: appointment.id,
        },
      });
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error en POST /api/appointments:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear el turno" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const hasPage = url.searchParams.has("page");

    await autoCompletePayments();

    // Backward compatible: without ?page, return plain array
    if (!hasPage) {
      const appointments = await prisma.appointment.findMany({
        include: { service: true, payments: true },
        orderBy: { date: "desc" },
      });
      return NextResponse.json(appointments);
    }

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip,
        take: limit,
        include: { service: true, payments: true },
        orderBy: { date: "desc" },
      }),
      prisma.appointment.count(),
    ]);

    return NextResponse.json({
      data: appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    let servicePrice: number | undefined;
    if (body.serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (svc) servicePrice = Math.round(svc.price);
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        name: body.name,
        lastName: body.lastName,
        telefono: body.telefono,
        instagram: body.instagram,
        notes: body.notes,
        serviceId: body.serviceId,
        servicePrice,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}

