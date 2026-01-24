import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const map = new Map<string, any>();

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
    client.totalAppointments += 1;

    if (!client.lastAppointment || new Date(a.date) > new Date(client.lastAppointment)) {
      client.lastAppointment = a.date;
    }
  }

  return NextResponse.json(Array.from(map.values()));
}
