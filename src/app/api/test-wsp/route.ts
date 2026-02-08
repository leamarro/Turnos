import { NextResponse } from "next/server"

export async function GET() {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "5492932415221",
        type: "text",
        text: {
          body: "🧪 TEST DIRECTO SIN HELPERS",
        },
      }),
    }
  )

  const data = await res.json()

  return NextResponse.json({
    status: res.status,
    data,
  })
}
