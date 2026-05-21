import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const identifier = decodeURIComponent(params.id);

  let appointments = await prisma.appointment.findMany({
    where: { OR: [{ telefono: identifier }, { instagram: identifier }] },
    select: { id: true },
  });

  if (appointments.length === 0 && identifier.includes("_")) {
    const parts = identifier.split("_");
    const name = parts[0];
    const lastName = parts.slice(1).join("_");

    appointments = await prisma.appointment.findMany({
      where: { name, lastName: lastName || null },
      select: { id: true },
    });
  }

  if (appointments.length === 0) {
    appointments = await prisma.appointment.findMany({
      where: { name: identifier },
      select: { id: true },
    });
  }

  if (appointments.length === 0) {
    const single = await prisma.appointment.findUnique({
      where: { id: identifier },
      select: { id: true },
    });
    if (single) {
      appointments = [single];
    }
  }

  const ids = appointments.map((a) => a.id);

  await prisma.payment.deleteMany({ where: { appointmentId: { in: ids } } });
  await prisma.appointment.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const identifier = decodeURIComponent(params.id);

  let appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { telefono: identifier },
        { instagram: identifier },
      ],
    },
    orderBy: { date: "desc" },
    include: {
      service: true,
    },
  });

  if (appointments.length === 0 && identifier.includes("_")) {
    const parts = identifier.split("_");
    const name = parts[0];
    const lastName = parts.slice(1).join("_");

    appointments = await prisma.appointment.findMany({
      where: { name, lastName: lastName || null },
      orderBy: { date: "desc" },
      include: { service: true },
    });
  }

  if (appointments.length === 0) {
    appointments = await prisma.appointment.findMany({
      where: { name: identifier },
      orderBy: { date: "desc" },
      include: { service: true },
    });
  }

  if (appointments.length === 0) {
    const single = await prisma.appointment.findUnique({
      where: { id: identifier },
      include: { service: true },
    });
    if (single) {
      appointments = [single];
    }
  }

  if (appointments.length === 0) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 }
    );
  }

  // Fetch payments for all appointments
  const appointmentIds = appointments.map((a) => a.id);
  const allPayments = await prisma.payment.findMany({
    where: { appointmentId: { in: appointmentIds } },
  });

  const paymentMap = new Map<string, typeof allPayments>();
  for (const p of allPayments) {
    if (!paymentMap.has(p.appointmentId)) paymentMap.set(p.appointmentId, []);
    paymentMap.get(p.appointmentId)!.push(p);
  }

  // Calculate aggregated stats
  const serviceCount = new Map<string, { name: string; count: number }>();
  let totalSpent = 0;

  for (const a of appointments) {
    const appPayments = paymentMap.get(a.id) || [];
    const paid = appPayments.reduce((acc, p) => acc + p.amount, 0);
    totalSpent += paid;

    const svcName = a.service?.name || "Sin servicio";
    const existing = serviceCount.get(svcName);
    if (existing) {
      existing.count++;
    } else {
      serviceCount.set(svcName, { name: svcName, count: 1 });
    }
  }

  const topServices = Array.from(serviceCount.values()).sort(
    (a, b) => b.count - a.count
  );

  const first = appointments[0];

  return NextResponse.json({
    name: first.name ?? "",
    lastName: first.lastName ?? "",
    telefono: first.telefono ?? null,
    instagram: first.instagram ?? null,
    totalSpent,
    totalAppointments: appointments.length,
    topServices: topServices.slice(0, 3),
    lastAppointment: appointments[0]?.date ?? null,
    appointments: appointments.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status,
      service: a.service,
    })),
  });
}
