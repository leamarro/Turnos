import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1️⃣ Buscar el turno por ID
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment || !appointment.telefono) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // 2️⃣ Buscar todos los turnos de ese teléfono
    const appointments = await prisma.appointment.findMany({
      where: { telefono: appointment.telefono },
      include: { service: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      name: appointment.name,
      lastName: appointment.lastName,
      telefono: appointment.telefono,
      appointments,
    });
  } catch (error) {
    console.error("CLIENT DETAIL ERROR:", error);
    return NextResponse.json(
      { error: "Error cargando cliente" },
      { status: 500 }
    );
  }
}
