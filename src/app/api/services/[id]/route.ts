// /app/api/services/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, price } = await req.json();

    const service = await prisma.service.update({
      where: { id },
      data: { name, price: Number(price) },
    });

    return NextResponse.json(service);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo actualizar el servicio" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo eliminar el servicio" }, { status: 500 });
  }
}
