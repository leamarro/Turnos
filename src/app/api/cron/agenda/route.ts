import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

// 👇 MISMA FUNCIÓN, solo ajustamos el "ahora" a Argentina
function getDateRange(offsetDays: number) {
  const now = new Date()
  now.setHours(now.getHours() - 3) // 🇦🇷 UTC-3

  const start = new Date(now)
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
    const label =
      type === "manana" ? "📅 Euge estos son los turnos de mañana" : "📅 Euge estos son los turnos de hoy"

    const { start, end } = getDateRange(offset)

    const turnos = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    if (turnos.length === 0) {
      await sendWhatsApp(`${label}\n\n❌ No tenés turnos`)
      return NextResponse.json({ ok: true, empty: true })
    }

    const listado = turnos
      .map((t) => {
      const d = new Date(t.date)
      d.setHours(d.getHours() - 3) // 🇦🇷 corregimos visualización
      
      const hora = d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })

        const nombre =
          [t.name, t.lastName].filter(Boolean).join(" ") ||
          [t.user?.name, t.user?.lastName].filter(Boolean).join(" ") ||
          "Sin nombre"

        return `• ${hora} – ${nombre}`
      })
      .join("\n")

    const message = `
${label}

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
