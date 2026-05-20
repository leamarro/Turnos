// /app/api/services/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, price, duration, color } = await req.json();
    const parsedPrice = Number(price);
    const parsedDuration = Number(duration);

    if (!name || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Datos de servicio invalidos" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        price: parsedPrice,
        ...(Number.isFinite(parsedDuration) && parsedDuration > 0
          ? { duration: parsedDuration }
          : {}),
        ...(color ? { color } : {}),
      },
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
