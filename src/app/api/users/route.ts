import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, telefono } = body;

    if (!telefono) {
      return NextResponse.json({ error: "El teléfono es obligatorio" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { telefono } });

    if (!user) {
      user = await prisma.user.create({
        data: { name: name || "Sin nombre", telefono },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error en /api/users:", error);
    return NextResponse.json({ error: "Error al procesar el usuario" }, { status: 500 });
  }
}
