import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        payments: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
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
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    await prisma.payment.deleteMany({
      where: {
        appointmentId: params.id,
      },
    })

    await prisma.appointment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Error eliminando turno" },
      { status: 500 }
    )
  }
}
