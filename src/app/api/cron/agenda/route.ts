import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

/**
 * Calcula el día de Argentina correctamente
 * y lo traduce a UTC para Prisma
 */
function getArgentinaDate(offsetDays: number) {
  const now = new Date()

  // 1️⃣ Ahora en Argentina (UTC-3)
  const argentinaNow = new Date(now.getTime() - 3 * 60 * 60 * 1000)

  // 2️⃣ Día argentino real
  const year = argentinaNow.getFullYear()
  const month = argentinaNow.getMonth()
  const day = argentinaNow.getDate() + offsetDays

  // 3️⃣ 00:00 Argentina expresado en UTC (03:00 UTC)
  const start = new Date(Date.UTC(year, month, day, 3, 0, 0, 0))

  // 4️⃣ 23:59 Argentina expresado en UTC (02:59 UTC del día siguiente)
  const end = new Date(start)
  end.setUTCHours(26, 59, 59, 999)

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
    return NextResponse.json({
      ok: true,
      message: "Sin turnos",
      range: { start, end },
    })
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
      ? "📅 Euge, estos son los turnos de mañana"
      : "📅 Euge, estos son los turnos de hoy"

  const message = `${title}\n\n${list}`

  await sendWhatsApp(message)

  return NextResponse.json({ ok: true })
}
