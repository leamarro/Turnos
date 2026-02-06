import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

function getArgentinaDate(offsetDays: number) {
  const now = new Date()

  // Pasamos a horario Argentina (UTC-3)
  const argentinaTime = new Date(
    now.getTime() - 3 * 60 * 60 * 1000
  )

  const start = new Date(argentinaTime)
  start.setDate(start.getDate() + offsetDays)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // hoy | manana

  const offsetDays = type === "manana" ? 1 : 0
  const { start, end } = getArgentinaDate(offsetDays)

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      status: "pending",
    },
    orderBy: {
      date: "asc",
    },
  })

  if (appointments.length === 0) {
    return NextResponse.json({ ok: true, message: "Sin turnos" })
  }

  const list = appointments
    .map((a) => {
      const time = new Date(a.date).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      return `🕒 ${time} - ${a.name ?? ""} ${a.lastName ?? ""}`
    })
    .join("\n")

  const title =
    type === "manana"
      ? "📅 Turnos de mañana"
      : "📅 Turnos de hoy"

  const message = `${title}\n\n${list}`

  await sendWhatsApp(message)

  return NextResponse.json({ ok: true })
}
