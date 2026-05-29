import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

const SECRET = process.env.CRON_SECRET;
const ADMINS_EMAIL = ["leaa.marrocchi@gmail.com", "eugeardissone@gmail.com"];

export const dynamic = "force-dynamic";

function getDateRange(offsetDays: number) {
  const start = new Date();
  start.setDate(start.getDate() + offsetDays);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function GET(req: Request) {
  try {
    if (SECRET && req.headers.get("x-cron-secret") !== SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type !== "hoy" && type !== "manana") {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const offset = type === "manana" ? 1 : 0;
    const title = type === "manana" ? "Turnos de manana" : "Turnos de hoy";
    const { start, end } = getDateRange(offset);

    if (start.getDay() === 0) {
      await sendWhatsApp(`${title}\n\nHoy no se trabaja 😴`);
      await sendEmail(ADMINS_EMAIL, title, `Hoy no se trabaja 😴`);
      return NextResponse.json({ ok: true, sunday: true });
    }

    const turnos = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        User: true,
        service: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    if (turnos.length === 0) {
      await sendWhatsApp(`${title}\n\nNo tenes turnos`);
      await sendEmail(ADMINS_EMAIL, title, `No tenes turnos`);
      return NextResponse.json({ ok: true, empty: true });
    }

    const listado = turnos
      .map((turno) => {
        const hora = new Date(turno.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Argentina/Buenos_Aires",
        });

        const nombre =
          [turno.name, turno.lastName].filter(Boolean).join(" ") ||
          [turno.User?.name, turno.User?.lastName].filter(Boolean).join(" ") ||
          "Sin nombre";

        const servicio = turno.service?.name || "";

        return `🕐 ${hora}  ${nombre}${servicio ? ` (${servicio})` : ""}`;
      })
      .join("\n");

    const message = `${title}\n\n${listado}`.trim();

    await sendWhatsApp(message);
    await sendEmail(ADMINS_EMAIL, title, message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error sending agenda" },
      { status: 500 }
    );
  }
}
