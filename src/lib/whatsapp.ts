const GRAPH_URL = "https://graph.facebook.com/v18.0"

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN! // 👈 ESTE CAMBIO

const ADMIN_NUMBERS = [
  "5492932415221",
]

export async function sendWhatsApp(message: string) {
  for (const to of ADMIN_NUMBERS) {
    const res = await fetch(`${GRAPH_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    })

    const data = await res.json()
    console.log("WhatsApp response:", data)
  }
}
