import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = await prisma.user.findMany({
      include: {
        appointments: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = clients.map((c) => ({
      id: c.id,
      name: c.name,
      lastName: c.lastName ?? "",
      telefono: c.telefono,
      totalAppointments: c.appointments.length,
      lastAppointment:
        c.appointments.length > 0
          ? c.appointments
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )[0].date
          : null,
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    console.error("ERROR CLIENTS:", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes" },
      { status: 500 }
    );
  }
}
//