import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * TEMPORARY diagnostic: tries to send one test email through the configured
 * sender (SMTP first, else Gmail) and reports the exact result/error. It only
 * ever sends to the site owner's own address, so it can't be abused to spam.
 * Remove this route once email is confirmed working.
 */
export async function GET() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 465;
  const to =
    process.env.OWNER_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;

  const config = {
    usingSmtp: Boolean(host && user && pass),
    host: host || null,
    port,
    user: user || null,
    hasPass: Boolean(pass),
    passLength: pass ? pass.length : 0,
    to: to || null,
    gmailFallback: Boolean(
      process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD,
    ),
  };

  if (!to) {
    return NextResponse.json({
      ok: false,
      error: "No recipient — set OWNER_EMAIL (or SMTP_USER/GMAIL_USER).",
      config,
    });
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
    return NextResponse.json({
      ok: false,
      error: "No mailer configured (neither SMTP_* nor GMAIL_*).",
      config,
    });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Test — Kurdistan Hotels email setup ✅",
      text: "This is a test email. If you received it, sending works.",
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
