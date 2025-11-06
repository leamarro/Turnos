import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const services = await prisma.service.findMany();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
