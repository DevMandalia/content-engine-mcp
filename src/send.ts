import nodemailer from "nodemailer";
import { EngineError } from "./types.js";

export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult = { ok: true; adapter: string; id: string; to: string } | { ok: false; error: string };

export type SendFn = (message: EmailMessage) => Promise<{ id: string }>;

export function refuseUnlessConfirmed(confirm: boolean): void {
  if (confirm !== true) {
    throw new EngineError("Refusing to send: pass confirm=true after the user explicitly agrees.", "CONFIRM");
  }
}

export async function sendViaResend(
  message: EmailMessage,
  apiKey = process.env.RESEND_API_KEY,
  fetcher: typeof fetch = fetch
): Promise<{ id: string }> {
  if (!apiKey) throw new EngineError("RESEND_API_KEY is not set.", "SEND");
  const res = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: message.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text
    })
  });
  const body = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !body.id) {
    throw new EngineError(`Resend failed (${res.status}): ${body.message ?? "unknown error"}`, "SEND");
  }
  return { id: body.id };
}

export async function sendViaSmtp(message: EmailMessage): Promise<{ id: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new EngineError("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set.", "SEND");
  }
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = (process.env.SMTP_SECURE ?? "true") !== "false";
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  const info = await transporter.sendMail({
    from: message.from || process.env.SMTP_FROM || user,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text
  });
  return { id: info.messageId };
}

export function adapterFor(name: "resend" | "smtp"): SendFn {
  if (name === "resend") return (m) => sendViaResend(m);
  return (m) => sendViaSmtp(m);
}
