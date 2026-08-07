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

    const existing = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    const serviceChanged =
      body.serviceId != null && body.serviceId !== existing.serviceId;

    let servicePrice = existing.servicePrice;
    if (serviceChanged && body.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: body.serviceId },
        select: { price: true },
      });
      servicePrice = service ? Math.round(service.price ?? 0) : 0;
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        name: body.name || null,
        lastName: body.lastName || null,
        telefono: body.telefono || null,
        instagram: body.instagram || null,
        notes: body.notes || null,
        serviceId: body.serviceId,
        servicePrice,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
      },
    });

    if (serviceChanged && servicePrice != null) {
      const totalPagado = existing.payments.reduce(
        (acc, p) => acc + p.amount,
        0
      );
      if (totalPagado > servicePrice) {
        let overage = totalPagado - servicePrice;
        const payments = [...existing.payments].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        for (const payment of payments) {
          if (overage <= 0) break;
          if (payment.amount <= overage) {
            await prisma.payment.delete({ where: { id: payment.id } });
            overage -= payment.amount;
          } else {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { amount: payment.amount - overage },
            });
            overage = 0;
          }
        }
      }
    }

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
