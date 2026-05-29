import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

const SECRET = process.env.CRON_SECRET;
const ADMINS_EMAIL = ["leaa.marrocchi@gmail.com", "eugeardissone@gmail.com"];

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (SECRET && req.headers.get("x-cron-secret") !== SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const reminders = [
    { label: "reminder_2h", min: 110, max: 130 },
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
      });
      const nombre =
        [t.name, t.lastName].filter(Boolean).join(" ") ||
        t.User?.name ||
        "Sin nombre";
      const servicio = t.service?.name ?? "";
      const msg = `⏰ Recordatorio\n\n${nombre} a las ${hora} hs${servicio ? ` · ${servicio}` : ""}`;

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
}
