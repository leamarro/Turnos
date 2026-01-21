import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const telefono = params.id;

    // Buscar todos los turnos de ese teléfono
    const appointments = await prisma.appointment.findMany({
      where: {
        telefono: telefono,
      },
      include: {
        service: {
          select: { name: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const { name, lastName } = appointments[0];

    return NextResponse.json({
      name,
      lastName,
      telefono,
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
