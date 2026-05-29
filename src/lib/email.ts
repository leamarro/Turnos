import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "notificaciones@beatmakeup.com";

export async function sendEmail(to: string[], subject: string, body: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject,
    text: body,
  });
}
