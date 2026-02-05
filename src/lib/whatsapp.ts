import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendWhatsApp(message: string) {
  const numbers = process.env.ADMIN_WHATSAPP!.split(",")

  for (const to of numbers) {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to,
    })
  }
}
