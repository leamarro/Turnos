import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const errors: string[] = [];

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const turnos = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end } },
    include: { User: true },
    orderBy: { date: "asc" },
  });

  let message = "📋 Turnos de hoy\n\n";
  if (turnos.length === 0) {
    message += "No tenés turnos";
  } else {
    message += turnos
      .map((t) => {
        const hora = new Date(t.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const nombre =
          [t.name, t.lastName].filter(Boolean).join(" ") ||
          t.User?.name ||
          "Sin nombre";
        return `- ${hora} - ${nombre}`;
      })
      .join("\n");
    message += `\n\nTotal: ${turnos.length} turnos`;
  }

  try {
    await sendWhatsApp(message);
  } catch (e: any) {
    errors.push("WhatsApp: " + (e?.message || "error"));
  }

  try {
    await sendEmail(["leaa.marrocchi@gmail.com"], "Turnos de hoy", message);
  } catch (e: any) {
    errors.push("Email: " + (e?.message || "error"));
  }

  return NextResponse.json({
    ok: errors.length === 0,
    turnos: turnos.length,
    message: message.slice(0, 200),
    errors: errors.length ? errors : undefined,
  });
}
