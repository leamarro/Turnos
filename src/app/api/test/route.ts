import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const errors: string[] = [];

  try {
    await sendWhatsApp("🧪 Prueba desde el test endpoint");
    console.log("WhatsApp enviado");
  } catch (e: any) {
    errors.push("WhatsApp: " + (e?.message || "error"));
  }

  try {
    await sendEmail(
      ["leaa.marrocchi@gmail.com"],
      "Prueba de notificaciones",
      "🧪 Prueba desde el test endpoint",
    );
    console.log("Email enviado");
  } catch (e: any) {
    errors.push("Email: " + (e?.message || "error"));
  }

  return NextResponse.json({
    ok: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  });
}
