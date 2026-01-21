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

    const clientsMap = new Map<
      string,
      {
        id: string;
        name: string;
        lastName: string;
        telefono: string;
        totalAppointments: number;
        lastAppointment: string | null;
      }
    >();

    for (const a of appointments) {
      if (!a.telefono) continue;

      if (!clientsMap.has(a.telefono)) {
        clientsMap.set(a.telefono, {
          id: a.id,
          name: a.name ?? "",
          lastName: a.lastName ?? "",
          telefono: a.telefono,
          totalAppointments: 0,
          lastAppointment: a.date
            ? a.date.toISOString()
            : null,
        });
      }

      const client = clientsMap.get(a.telefono)!;
      client.totalAppointments += 1;

      if (
        a.date &&
        (!client.lastAppointment ||
          new Date(a.date) > new Date(client.lastAppointment))
      ) {
        client.lastAppointment = a.date.toISOString();
      }
    }

    return NextResponse.json(Array.from(clientsMap.values()));
  } catch (error) {
    console.error("ERROR CLIENTS:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes" },
      { status: 500 }
    );
  }
}
