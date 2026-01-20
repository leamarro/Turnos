import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1️⃣ Traemos todos los turnos necesarios
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        lastName: true,
        telefono: true,
        date: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    // 2️⃣ Mapa de clientes agrupados por teléfono
    const clientsMap = new Map<
      string,
      {
        id: string;
        name: string;
        lastName: string;
        telefono: string;
        appointments: any[];
      }
    >();

    // 3️⃣ Agrupación segura (🔥 clave para que no rompa TypeScript)
    for (const a of appointments) {
      // ⛔ sin teléfono → no se puede agrupar
      if (!a.telefono) continue;

      if (!clientsMap.has(a.telefono)) {
        clientsMap.set(a.telefono, {
          id: a.id,
          name: a.name ?? "",
          lastName: a.lastName ?? "",
          telefono: a.telefono,
          appointments: [],
        });
      }

      clientsMap.get(a.telefono)!.appointments.push(a);
    }

    // 4️⃣ Respuesta final
    return NextResponse.json(Array.from(clientsMap.values()));
  } catch (error) {
    console.error("ERROR CLIENTS:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes" },
      { status: 500 }
    );
  }
}
