import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

const SECRET = process.env.CRON_SECRET;
const ADMINS_EMAIL = ["leaa.marrocchi@gmail.com", "eugeardissone@gmail.com"];

export const dynamic = "force-dynamic";

async function getConfig() {
  let config = await prisma.notificationConfig.findUnique({
    where: { type: "reminder" },
  });
  if (!config) {
    config = await prisma.notificationConfig.create({
      data: {
        type: "reminder",
        template: "\u23f0 {titulo}\n\n{nombre} a las {hora} hs \u00b7 {servicio}",
        enabled: true,
        workDays: "1,2,3,4,5,6",
        hoursBefore: 2,
      },
    });
  }
  return config;
}

export async function GET(req: Request) {
  try {
    if (SECRET && req.headers.get("x-cron-secret") !== SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await getConfig();
    if (!config.enabled) {
      return NextResponse.json({ ok: true, disabled: true });
    }

    const now = new Date();
    const h = config.hoursBefore;
    const windowMin = h * 60 - 10;
    const windowMax = h * 60 + 10;
    const reminders = [
      { label: `reminder_${h}h`, min: windowMin, max: windowMax },
    ];

    for (const r of reminders) {
      const minDate = new Date(now.getTime() + r.min * 60000);
      const maxDate = new Date(now.getTime() + r.max * 60000);

      const turnos = await prisma.appointment.findMany({
        where: {
          date: { gte: minDate, lte: maxDate },
          status: { not: "cancelled" },
        },
        include: { service: true, User: true },
      });

      for (const t of turnos) {
        const todayDay = new Date(t.date).getDay().toString();
        const workDays = config.workDays.split(",").filter(Boolean);
        if (!workDays.includes(todayDay)) continue;

        const alreadySent = await prisma.notificationLog.findUnique({
          where: {
            appointmentId_type_channel: {
              appointmentId: t.id,
              type: r.label,
              channel: "whatsapp",
            },
          },
        });
        if (alreadySent) continue;

        const hora = new Date(t.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Argentina/Buenos_Aires",
        });
        const nombre =
          [t.name, t.lastName].filter(Boolean).join(" ") ||
          t.User?.name ||
          "Sin nombre";
        const servicio = t.service?.name ?? "";

        const msg = config.template
          .replace(/\{titulo\}/g, "Recordatorio")
          .replace(/\{nombre\}/g, nombre)
          .replace(/\{hora\}/g, hora)
          .replace(/\{servicio\}/g, servicio)
          .trim();

        await sendWhatsApp(msg);
        await sendEmail(ADMINS_EMAIL, `Recordatorio: ${nombre} ${hora}`, msg);

        await prisma.notificationLog.create({
          data: {
            appointmentId: t.id,
            type: r.label,
            channel: "whatsapp",
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en reminders:", error);
    return NextResponse.json({ ok: true, error: String(error) });
  }
}
