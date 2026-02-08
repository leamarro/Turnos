type SendWhatsAppParams = {
  message: string
}

export async function sendWhatsApp({ message }: SendWhatsAppParams) {
  const phonesRaw = process.env.ADMIN_PHONES

  if (!phonesRaw) {
    throw new Error("ADMIN_PHONES no definido")
  }

  const phones = phonesRaw.split(",").map((p) => p.trim())

  for (const phone of phones) {
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
          to: phone,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error("Error WhatsApp a", phone, error)
    }
  }
}
