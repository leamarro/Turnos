import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { amount, method } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    await prisma.payment.create({
      data: {
        amount,
        method: method || "deposit",
        appointmentId: id,
      },
    })

    // Si no estaba completed, lo ponemos pending
    if (appointment.status !== "completed") {
      await prisma.appointment.update({
        where: { id },
        data: { status: "pending" },
      })
    }

    return NextResponse.json({ message: "Seña agregada correctamente" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error agregando seña" },
      { status: 500 }
    )
  }
}