import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ===============================
// GET → obtener precios actuales
// ===============================
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        name: true,
        price: true,
      },
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error("ERROR GET PRICES:", err);
    return NextResponse.json(
      { error: "No se pudieron obtener los precios" },
      { status: 500 }
    );
  }
}

// ===============================
// PUT → actualizar precios
// ===============================
export async function PUT(req: Request) {
  try {
    const { perfilado, maquillaje, prueba } = await req.json();

    // PERFILADO
    await prisma.service.updateMany({
      where: { name: "Perfilado" },
      data: { price: perfilado },
    });

    // MAQUILLAJE
    await prisma.service.updateMany({
      where: { name: "Maquillaje" },
      data: { price: maquillaje },
    });

    // PRUEBA MAQUILLAJE
    await prisma.service.updateMany({
      where: { name: "Prueba Maquillaje" },
      data: { price: prueba },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ERROR UPDATE PRICES:", err);
    return NextResponse.json(
      { error: "No se pudieron actualizar los precios" },
      { status: 500 }
    );
  }
}
