import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// PATCH — actualizar estado del turno
// =========================
export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { status } = await req.json();

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }, // 👈 Campo correcto según tu schema
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("❌ ERROR PATCH APPOINTMENT:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE — eliminar turno
// =========================
export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = params;

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ ERROR DELETE APPOINTMENT:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el turno" },
      { status: 500 }
    );
  }
}
