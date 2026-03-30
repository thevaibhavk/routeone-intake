import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(input: { to: string; subject: string; html: string; text: string }) {
  const transport = getTransport();
  const from = process.env.MAIL_FROM || "Route One <no-reply@routeone.local>";

  if (!transport) {
    console.log("Mail fallback", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  await transport.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text });
  return { delivered: true };
}
