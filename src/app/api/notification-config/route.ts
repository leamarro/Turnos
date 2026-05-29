import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  { type: "hoy", template: "\ud83d\udccb {titulo}\n\n{listado}" },
  { type: "manana", template: "\ud83d\udccb {titulo}\n\n{listado}" },
  { type: "reminder", template: "\u23f0 {titulo}\n\n{nombre} a las {hora} hs \u00b7 {servicio}" },
];

async function ensureDefaults() {
  for (const def of DEFAULTS) {
    await prisma.notificationConfig.upsert({
      where: { type: def.type },
      update: {},
      create: { ...def, enabled: true, workDays: "1,2,3,4,5,6" },
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
    const { type, enabled, template, workDays } = body;

    if (!["hoy", "manana", "reminder"].includes(type)) {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const data: any = {};
    if (typeof enabled === "boolean") data.enabled = enabled;
    if (typeof template === "string" && template.trim()) data.template = template.trim();
    if (typeof workDays === "string") data.workDays = workDays;

    const config = await prisma.notificationConfig.upsert({
      where: { type },
      update: data,
      create: {
        type,
        enabled: enabled ?? true,
        template: template ?? DEFAULTS.find((d) => d.type === type)!.template,
        workDays: workDays ?? "1,2,3,4,5,6",
      },
    });

    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
