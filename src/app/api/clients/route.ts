import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        lastName: true,
        telefono: true,
        date: true,
      },
    });

    // Agrupar clientes por teléfono
    const clientsMap = new Map<
      string,
      {
        id: string;
        name: string;
        lastName: string;
        telefono: string;
        totalAppointments: number;
        lastAppointment: Date | null;
      }
    >();

    for (const a of appointments) {
      if (!clientsMap.has(a.telefono)) {
        clientsMap.set(a.telefono, {
          id: a.id,
          name: a.name,
          lastName: a.lastName,
          telefono: a.telefono,
          totalAppointments: 1,
          lastAppointment: a.date,
        });
      } else {
        const client = clientsMap.get(a.telefono)!;
        client.totalAppointments += 1;

        if (
          !client.lastAppointment ||
          a.date > client.lastAppointment
        ) {
          client.lastAppointment = a.date;
        }
      }
    }

    return NextResponse.json(Array.from(clientsMap.values()));
  } catch (e) {
    console.error("ERROR CLIENTS:", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes" },
      { status: 500 }
    );
  }
}
