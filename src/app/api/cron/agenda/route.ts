import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

function getDateRange(offsetDays: number) {
  const start = new Date()
  start.setDate(start.getDate() + offsetDays)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // hoy | manana

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 })
    }

    const offset = type === "manana" ? 1 : 0

    const title =
      type === "manana"
        ? "📅 Turnos de mañana 🤍"
        : "📅 Turnos de hoy 🤍"

    const { start, end } = getDateRange(offset)

    const turnos = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        status: "pending",
      },
      include: {
        User: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    if (turnos.length === 0) {
      await sendWhatsApp(`${title}\n\n❌ No tenés turnos`)
      return NextResponse.json({ ok: true, empty: true })
    }

    const listado = turnos
      .map((t) => {
        const hora = new Date(t.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // 👈 17:00 en vez de 5 PM
        })

        const nombre =
          [t.name, t.lastName].filter(Boolean).join(" ") ||
          [t.User?.name, t.User?.lastName].filter(Boolean).join(" ") ||
          "Sin nombre"

        return `• ${hora} – ${nombre}`
      })
      .join("\n")

    const message = `
${title}

${listado}

📌 Total: ${turnos.length} turnos
`.trim()

    await sendWhatsApp(message)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error sending agenda" },
      { status: 500 }
    )
  }
}
