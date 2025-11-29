import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { name, price } = await req.json();

  const service = await prisma.service.update({
    where: { id },
    data: { name, price: Number(price) },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await prisma.service.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
