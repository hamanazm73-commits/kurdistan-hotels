import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * Temporary diagnostic for the Gmail booking-email setup. Open
 * /api/test-email in the browser: it reports whether the env vars are set and
 * whether the credentials are accepted, then sends a test email to GMAIL_USER.
 */
export async function GET(): Promise<NextResponse> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  const info: Record<string, unknown> = {
    hasGmailUser: Boolean(user),
    hasGmailAppPassword: Boolean(pass),
    userMasked: user ? user.replace(/(.{2}).*(@.*)/, "$1***$2") : null,
    appPasswordLength: pass ? pass.length : 0, // should be 16 (no spaces)
  };

  if (!user || !pass) {
    info.result = "MISSING_ENV";
    info.hint =
      "GMAIL_USER and/or GMAIL_APP_PASSWORD is not set in Vercel. Check the variable NAMES are exactly these.";
    return NextResponse.json(info);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.verify();
    info.credentialsOk = true;
    const sent = await transporter.sendMail({
      from: `"Kurdistan Hotels" <${user}>`,
      to: user,
      subject: "Test — Kurdistan Hotels email works ✅",
      text: "If you received this, booking emails are set up correctly.",
    });
    info.result = "SENT";
    info.messageId = sent.messageId ?? "ok";
    info.hint = `Check the inbox (and Spam) of ${user}.`;
  } catch (e) {
    info.result = "ERROR";
    info.error = e instanceof Error ? e.message : String(e);
  }
  return NextResponse.json(info);
}
