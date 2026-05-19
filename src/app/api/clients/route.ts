import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ClientSummary = {
  id: string;
  name: string;
  lastName: string;
  telefono: string | null;
  instagram: string | null;
  totalAppointments: number;
  lastAppointment: Date | null;
};

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      select: {
        name: true,
        lastName: true,
        telefono: true,
        instagram: true,
        date: true,
      },
    });

    const map = new Map<string, ClientSummary>();

    for (const a of appointments) {
      const key = a.telefono || a.instagram;
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: a.name ?? "",
          lastName: a.lastName ?? "",
          telefono: a.telefono ?? null,
          instagram: a.instagram ?? null,
          totalAppointments: 0,
          lastAppointment: null,
        });
      }

      const client = map.get(key);
      if (!client) continue;

      client.totalAppointments += 1;

      if (!client.lastAppointment || new Date(a.date) > new Date(client.lastAppointment)) {
        client.lastAppointment = a.date;
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (error) {
    console.error("Error en GET /api/clients:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}
