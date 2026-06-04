import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "onboarding@resend.dev";

export async function sendEmail(to: string[], subject: string, body: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      text: body,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
