// /app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =========================
// GET: listar todos los servicios
// =========================
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: { id: true, name: true, price: true, duration: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(services);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudieron cargar los servicios" },
      { status: 500 }
    );
  }
}

// =========================
// POST: crear un nuevo servicio
// =========================
export async function POST(req: Request) {
  try {
    const { name, price, duration } = await req.json();

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: Number(price),
        duration: Number(duration),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo crear el servicio" },
      { status: 500 }
    );
  }
}

// =========================
// PUT: actualizar un servicio
// =========================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, price, duration } = await req.json();

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        duration: Number(duration),
      },
    });

    return NextResponse.json(updatedService);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo actualizar el servicio" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE: eliminar un servicio
// =========================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo eliminar el servicio" },
      { status: 500 }
    );
  }
}
