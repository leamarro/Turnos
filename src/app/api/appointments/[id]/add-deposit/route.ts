import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const amount = Number(body.amount)
    const method = body.method || "Efectivo"

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      )
    }

    // Crear pago
    await prisma.payment.create({
      data: {
        amount,
        method,
        appointmentId: params.id,
      },
    })

    // Sumar pagos
    const payments = await prisma.payment.aggregate({
      where: {
        appointmentId: params.id,
      },
      _sum: {
        amount: true,
      },
    })

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    const totalPaid = payments._sum.amount || 0
    const price = appointment?.servicePrice || 0

    // Cambiar status si está pago
    if (totalPaid >= price && price > 0) {
      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          status: "PAID",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error agregando pago" },
      { status: 500 }
    )
  }
}
