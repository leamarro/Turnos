import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

function getDateRangeArgentina(offsetDays: number) {
  const now = new Date()

  // fecha actual en Argentina (UTC-3)
  const argentina = new Date(now.getTime() - 3 * 60 * 60 * 1000)

  const start = new Date(argentina)
  start.setDate(start.getDate() + offsetDays)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // hoy | manana

  const offset = type === "manana" ? 1 : 0
  const title =
    type === "manana"
      ? "📅 Turnos de mañana ❤️"
      : "📅 Turnos de hoy ❤️"

  const { start, end } = getDateRangeArgentina(offset)

  const turnos = await prisma.appointment.findMany({
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

  if (turnos.length === 0) {
    await sendWhatsApp({
      message: `${title}\n\n❌ No tenés turnos`,
    })

    return NextResponse.json({ ok: true, empty: true })
  }

  const list = turnos
    .map((t) => {
      const hora = new Date(t.date).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      const nombre = [t.name, t.lastName]
        .filter(Boolean)
        .join(" ") || "Sin nombre"

      return `🕒 ${hora} – ${nombre}`
    })
    .join("\n")

  const message = `
${title}

${list}

📌 Total: ${turnos.length} turnos
`.trim()

  await sendWhatsApp({ message })

  return NextResponse.json({ ok: true })
}
