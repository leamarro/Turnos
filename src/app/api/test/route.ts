import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GRAPH_URL = "https://graph.facebook.com/v18.0";

export async function GET() {
  const result: any = {};

  // Test WhatsApp
  try {
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

    result.whatsapp = {
      hasPhoneId: !!PHONE_NUMBER_ID,
      hasToken: !!ACCESS_TOKEN,
      phoneIdPrefix: PHONE_NUMBER_ID?.slice(0, 5),
      tokenPrefix: ACCESS_TOKEN?.slice(0, 10),
    };

    if (PHONE_NUMBER_ID && ACCESS_TOKEN) {
      const res = await fetch(
        `${GRAPH_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: "5492932415221",
            type: "text",
            text: { body: "🧪 Prueba de test" },
          }),
        },
      );
      const data = await res.json();
      result.whatsapp.response = data;
      result.whatsapp.httpStatus = res.status;
    }
  } catch (e: any) {
    result.whatsapp = { error: e?.message || "error" };
  }

  // Test Email
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    result.email = { hasKey: !!RESEND_API_KEY, keyPrefix: RESEND_API_KEY?.slice(0, 8) };

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: ["leaa.marrocchi@gmail.com"],
          subject: "Prueba de test",
          text: "🧪 Prueba",
        }),
      });
      const data = await res.json();
      result.email.response = data;
      result.email.httpStatus = res.status;
    }
  } catch (e: any) {
    result.email = { error: e?.message || "error" };
  }

  return NextResponse.json(result);
}
