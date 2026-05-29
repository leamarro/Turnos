import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULTS: {
  type: string;
  template: string;
  hoursBefore?: number;
  sendTime?: string;
}[] = [
  { type: "hoy", template: "\ud83d\udccb {titulo}\n\n{listado}", sendTime: "08:00" },
  { type: "manana", template: "\ud83d\udccb {titulo}\n\n{listado}", sendTime: "21:00" },
  { type: "reminder", template: "\u23f0 {titulo}\n\n{nombre} a las {hora} hs \u00b7 {servicio}", hoursBefore: 2 },
];

async function ensureDefaults() {
  for (const def of DEFAULTS) {
    await prisma.notificationConfig.upsert({
      where: { type: def.type },
      update: {},
      create: {
        type: def.type,
        template: def.template,
        enabled: true,
        workDays: "1,2,3,4,5,6",
        hoursBefore: def.hoursBefore ?? 2,
        sendTime: def.sendTime ?? "08:00",
      },
    });
  }
}

export async function GET() {
  await ensureDefaults();
  const configs = await prisma.notificationConfig.findMany({
    orderBy: { type: "asc" },
  });
  return NextResponse.json(configs);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type, enabled, template, workDays, hoursBefore, sendTime } = body;

    if (!["hoy", "manana", "reminder"].includes(type)) {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const data: any = {};
    if (typeof enabled === "boolean") data.enabled = enabled;
    if (typeof template === "string" && template.trim()) data.template = template.trim();
    if (typeof workDays === "string") data.workDays = workDays;
    if (typeof hoursBefore === "number" && hoursBefore >= 1) data.hoursBefore = hoursBefore;
    if (typeof sendTime === "string" && sendTime.trim()) data.sendTime = sendTime.trim();

    const config = await prisma.notificationConfig.upsert({
      where: { type },
      update: data,
      create: {
        type,
        enabled: enabled ?? true,
        template: template ?? DEFAULTS.find((d) => d.type === type)!.template,
        workDays: workDays ?? "1,2,3,4,5,6",
        hoursBefore: hoursBefore ?? DEFAULTS.find((d) => d.type === type)?.hoursBefore ?? 2,
        sendTime: sendTime ?? DEFAULTS.find((d) => d.type === type)?.sendTime ?? "08:00",
      },
    });

    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
