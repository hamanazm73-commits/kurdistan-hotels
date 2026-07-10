import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * TEMPORARY diagnostic: sends one test email through the configured sender
 * (SMTP first, else Gmail) to `?to=` (or the owner address) and reports the
 * exact result/error. Remove this route once email is confirmed working.
 */
export async function GET(req: Request) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 465;

  const override = new URL(req.url).searchParams.get("to");
  const to =
    override ||
    process.env.OWNER_EMAIL ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER;

  const config = {
    usingSmtp: Boolean(host && user && pass),
    host: host || null,
    port,
    from: user || process.env.GMAIL_USER || null,
    to: to || null,
  };

  if (!to) {
    return NextResponse.json({ ok: false, error: "No recipient. Add ?to=you@example.com", config });
  }

  let transporter: nodemailer.Transporter;
  let from: string;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    from = `"Kurdistan Hotels" <${user}>`;
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    from = `"Kurdistan Hotels" <${process.env.GMAIL_USER}>`;
  } else {
    return NextResponse.json({ ok: false, error: "No mailer configured.", config });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Test — Kurdistan Hotels booking email ✅",
      text: "This is a test of the booking-notification email. If you got it, sending works.",
    });
    return NextResponse.json({ ok: true, sentTo: to, messageId: info.messageId, config });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      config,
    });
  }
}
