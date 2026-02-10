import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating notes" },
      { status: 500 }
    );
  }
}
