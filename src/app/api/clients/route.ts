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
    name: string | null;
    lastName: string | null;
    telefono: string;
    appointments: any[];
  }
>();

for (const a of appointments) {
  // Validación obligatoria
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



    return NextResponse.json(Array.from(clientsMap.values()));
  } catch (e) {
    console.error("ERROR CLIENTS:", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes" },
      { status: 500 }
    );
  }
}
