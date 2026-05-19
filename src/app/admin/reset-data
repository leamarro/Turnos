import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.payment.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.user.deleteMany({});

    return NextResponse.json({ ok: true, message: "Datos borrados correctamente" });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ ok: false, error: "Error al borrar datos" }, { status: 500 });
  }
}
