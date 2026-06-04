import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = new Twilio(accountSid, authToken);

const ADMIN_NUMBERS = [
  "whatsapp:+5492932415221",
  "whatsapp:+5492932478730"
];

export async function sendWhatsApp(message: string) {
  for (const to of ADMIN_NUMBERS) {
    try {
      await client.messages.create({
        body: message,
        from: "whatsapp:+14155238886",
        to,
      });
    } catch (error) {
      console.error(`Error sending WhatsApp to ${to}:`, error);
    }
  }
}
