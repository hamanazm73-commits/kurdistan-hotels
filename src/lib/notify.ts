import "server-only";
import nodemailer from "nodemailer";
import type { Booking, Feedback } from "./types";

/**
 * Best-effort booking notification to Telegram. No-op when the env vars
 * are unset, and never throws — a notification must never block a booking.
 * Get a bot token from @BotFather and your chat id from @userinfobot.
 */
export async function notifyBooking(b: Booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const esc = (s: unknown) =>
    String(s).replace(/[<>&]/g, (c) =>
      c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
    );

  const text =
    `🏨 <b>حیجزی نوێ — New booking</b>\n\n` +
    `<b>هۆتێل / Hotel:</b> ${esc(b.hotel)}\n` +
    `<b>ناو / Name:</b> ${esc(b.name)}\n` +
    `<b>تەلەفۆن / Phone:</b> ${esc(b.phone)}\n` +
    `<b>ژوور / Room:</b> ${esc(b.roomType)}\n` +
    `<b>بەروار / Check-in:</b> ${esc(b.checkIn)}\n` +
    `<b>شەو / Nights:</b> ${esc(b.nights)}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    /* best-effort */
  }
}

/**
 * Pick the outgoing-mail transport. When SMTP_HOST / SMTP_USER / SMTP_PASS are
 * set (e.g. Zoho, so mail is sent from the business address
 * info@hotelskurdistan.com) it uses those; otherwise it falls back to the Gmail
 * sender. Returns null when neither is configured.
 */
function getMailer():
  | { transporter: ReturnType<typeof nodemailer.createTransport>; from: string }
  | null {
  const host = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (host && smtpUser && smtpPass) {
    const port = Number(process.env.SMTP_PORT) || 465;
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // 465 = SSL, 587 = STARTTLS
        auth: { user: smtpUser, pass: smtpPass },
      }),
      from: `"Kurdistan Hotels" <${smtpUser}>`,
    };
  }
  const gUser = process.env.GMAIL_USER;
  const gPass = process.env.GMAIL_APP_PASSWORD;
  if (gUser && gPass) {
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user: gUser, pass: gPass },
      }),
      from: `"Kurdistan Hotels" <${gUser}>`,
    };
  }
  return null;
}

/**
 * Best-effort booking email to the hotel's own address. Sends from the business
 * SMTP sender when configured, else Gmail. No-op when no sender or recipient is
 * set, and never throws — an email must never block a booking.
 */
export async function sendBookingEmail(b: Booking, to: string | undefined) {
  const mailer = getMailer();
  // Log WHY an email is skipped so a missing sender/recipient is diagnosable
  // from the Vercel logs. `to` is the hotel's notifyEmail, which owners fill in.
  if (!mailer || !to) {
    console.warn(
      `[email] skipped — sender:${mailer ? "set" : "missing"} recipient:${to ? "set" : "missing"}`,
    );
    return;
  }

  const esc = (s: unknown) =>
    String(s).replace(/[<>&]/g, (c) =>
      c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
    );
  const money = (n: number) => `${Math.round(n).toLocaleString("en-US")} دینار`;
  const total = (b.roomPrice || 0) * (b.nights || 1);

  const row = (label: string, value: unknown) =>
    `<tr>
      <td style="padding:11px 16px;color:#64748b;border-bottom:1px solid #eef2f7;">${label}</td>
      <td style="padding:11px 16px;font-weight:600;color:#0f172a;border-bottom:1px solid #eef2f7;text-align:right;">${esc(value)}</td>
    </tr>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1e3a5f;padding:24px;text-align:center;">
        <img src="https://hotelskurdistan.com/logo.png" alt="Kurdistan Hotels" width="72" height="72" style="width:72px;height:72px;display:inline-block;" />
        <div style="font-size:20px;font-weight:800;color:#ffffff;margin-top:10px;">Kurdistan Hotels</div>
        <div style="font-size:13px;color:#DFB250;letter-spacing:.5px;">هۆتێلەکانی کوردستان</div>
        <div style="font-size:18px;font-weight:700;color:#f5c542;margin-top:16px;">حیجزی نوێ — New booking</div>
        <div style="color:#cbd5e1;font-size:15px;margin-top:4px;">${esc(b.hotel)}</div>
      </div>
      <div style="padding:22px 24px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${row("ناو / Name", b.name)}
          ${row("تەلەفۆن / Phone", b.phone)}
          ${row("ژوور / Room", b.roomType)}
          ${row("بەروار / Check-in", b.checkIn)}
          ${row("شەو / Nights", b.nights)}
          ${row("نرخی شەو / Per night", money(b.roomPrice || 0))}
        </table>
        <div style="margin-top:20px;padding:18px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;text-align:center;">
          <div style="color:#64748b;font-size:13px;">کۆی گشتی / Total</div>
          <div style="font-size:26px;font-weight:800;color:#1e3a5f;margin-top:4px;">${money(total)}</div>
          <div style="color:#94a3b8;font-size:12px;margin-top:2px;">${money(b.roomPrice || 0)} × ${esc(b.nights)} شەو</div>
        </div>
        <div style="margin-top:16px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;color:#92400e;font-size:13px;line-height:1.6;">
          ⏳ ئەمە داواکاریی حیجزە — تکایە لە داشبۆردەکەتدا پشتڕاستی بکەرەوە تاکو ژوورەکە بۆ دەگیردرێت.<br/>
          This is a booking <b>request</b> — please confirm it in your dashboard to hold the room.
        </div>
      </div>
      <div style="background:#f1f5f9;padding:14px;text-align:center;color:#94a3b8;font-size:12px;">
        Kurdistan Hotels — هۆتێلەکانی کوردستان
      </div>
    </div>
  </div>`;

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: `حیجزی نوێ — ${b.hotel} (${money(total)})`,
      html,
    });
    console.log(`[email] sent to ${to}`);
  } catch (e) {
    // best-effort — a failed email must never block a booking, but log the
    // reason (bad app password, blocked login, etc.) so it can be fixed
    console.error(
      `[email] send failed: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/**
 * Best-effort notification to the SITE owner when a visitor sends feedback —
 * Telegram + an email to OWNER_EMAIL (falls back to the Gmail sender). Never
 * throws, so a notification hiccup can't block the feedback being saved.
 */
export async function notifyFeedback(fb: Feedback) {
  const esc = (s: unknown) =>
    String(s).replace(/[<>&]/g, (c) =>
      c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
    );
  const stars = fb.rating ? "⭐".repeat(Math.max(1, Math.min(5, fb.rating))) : "—";

  // 1) Telegram
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const text =
      `💬 <b>فیدباکی نوێ — New feedback</b>\n\n` +
      `<b>ناو / Name:</b> ${esc(fb.name || "—")}\n` +
      `<b>هەڵسەنگاندن / Rating:</b> ${stars}\n` +
      `<b>پەیوەندی / Contact:</b> ${esc(fb.contact || "—")}\n` +
      `<b>نامە / Message:</b>\n${esc(fb.message)}`;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch {
      /* best-effort */
    }
  }

  // 2) Email to the site owner
  const mailer = getMailer();
  const to =
    process.env.OWNER_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
  if (!mailer || !to) return;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1e3a5f;padding:22px;text-align:center;">
        <div style="font-size:18px;font-weight:700;color:#f5c542;">فیدباکی نوێ — New feedback</div>
      </div>
      <div style="padding:22px 24px;font-size:15px;color:#0f172a;">
        <p style="margin:0 0 8px;"><b>ناو / Name:</b> ${esc(fb.name || "—")}</p>
        <p style="margin:0 0 8px;"><b>هەڵسەنگاندن / Rating:</b> ${stars}</p>
        <p style="margin:0 0 8px;"><b>پەیوەندی / Contact:</b> ${esc(fb.contact || "—")}</p>
        <p style="margin:14px 0 6px;color:#64748b;">نامە / Message</p>
        <div style="padding:14px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;white-space:pre-wrap;">${esc(fb.message)}</div>
      </div>
      <div style="background:#f1f5f9;padding:14px;text-align:center;color:#94a3b8;font-size:12px;">
        Kurdistan Hotels — هۆتێلەکانی کوردستان
      </div>
    </div>
  </div>`;

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: `فیدباکی نوێ — New feedback ${stars !== "—" ? `(${stars})` : ""}`,
      html,
    });
    console.log(`[feedback-email] sent to ${to}`);
  } catch (e) {
    console.error(
      `[feedback-email] send failed: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}
