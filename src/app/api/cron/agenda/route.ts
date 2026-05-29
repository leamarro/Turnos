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

async function getConfig(type: string) {
  let config = await prisma.notificationConfig.findUnique({ where: { type } });
  if (!config) {
    const template =
      type === "manana"
        ? "\ud83d\udccb {titulo}\n\n{listado}"
        : "\ud83d\udccb {titulo}\n\n{listado}";
    config = await prisma.notificationConfig.create({
      data: { type, template, enabled: true, workDays: "1,2,3,4,5,6" },
    });
  }
  return config;
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

    const config = await getConfig(type);
    if (!config.enabled) {
      return NextResponse.json({ ok: true, disabled: true });
    }

    const offset = type === "manana" ? 1 : 0;
    const title = type === "manana" ? "Turnos de mañana" : "Turnos de hoy";
    const { start, end } = getDateRange(offset);

    const todayDay = start.getDay().toString();
    const workDays = config.workDays.split(",").filter(Boolean);
    if (!workDays.includes(todayDay)) {
      return NextResponse.json({ ok: true, skipped: true, reason: "Fuera de días laborables" });
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

    let body = config.template
      .replace(/\{titulo\}/g, title)
      .replace(/\{listado\}/g, listado || "No tenes turnos")
      .replace(/\{total\}/g, String(turnos.length))
      .trim();

    await sendWhatsApp(body);
    await sendEmail(ADMINS_EMAIL, title, body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error sending agenda" },
      { status: 500 }
    );
  }
}
