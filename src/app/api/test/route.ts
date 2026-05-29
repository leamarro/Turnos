import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {};

  result.env = {
    twilioSid: !!process.env.TWILIO_ACCOUNT_SID,
    twilioToken: !!process.env.TWILIO_AUTH_TOKEN,
    resendKey: !!process.env.RESEND_API_KEY,
  };

  try {
    await sendWhatsApp("🧪 Prueba con Twilio");
    result.whatsapp = { ok: true };
  } catch (e: any) {
    result.whatsapp = { error: e?.message || "error" };
  }

  try {
    await sendEmail(
      ["leaa.marrocchi@gmail.com"],
      "Prueba con Twilio",
      "🧪 Prueba con Twilio WhatsApp",
    );
    result.email = { ok: true };
  } catch (e: any) {
    result.email = { error: e?.message || "error" };
  }

  return NextResponse.json(result);
}
