import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { method } = body // ej: "cash", "transfer"

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { payments: true },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Turno no encontrado" },
        { status: 404 }
      )
    }

    if (!appointment.servicePrice) {
      return NextResponse.json(
        { error: "El turno no tiene precio definido" },
        { status: 400 }
      )
    }

    // 🔥 Calcular total ya pagado
    const totalPaid = appointment.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )

    const remainingAmount = appointment.servicePrice - totalPaid

    if (remainingAmount <= 0) {
      return NextResponse.json(
        { error: "El turno ya está completamente pagado" },
        { status: 400 }
      )
    }

    // 🔥 Crear pago restante
    await prisma.payment.create({
      data: {
        amount: remainingAmount,
        method: method || "cash",
        appointmentId: appointment.id,
      },
    })

    // 🔥 Actualizar estado a completed
    await prisma.appointment.update({
      where: { id },
      data: { status: "completed" },
    })

    return NextResponse.json({ message: "Pago completado correctamente" })
  } catch (error) {
    console.error("Error completing payment:", error)
    return NextResponse.json(
      { error: "Error al completar el pago" },
      { status: 500 }
    )
  }
}
