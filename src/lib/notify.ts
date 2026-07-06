import "server-only";
import nodemailer from "nodemailer";
import type { Booking } from "./types";

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
 * Best-effort booking email to the hotel's own address (via a Gmail sender).
 * No-op when GMAIL_USER / GMAIL_APP_PASSWORD or the recipient are unset, and
 * never throws — an email must never block a booking.
 * The app password comes from Google Account → Security → App passwords.
 */
export async function sendBookingEmail(b: Booking, to: string | undefined) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || !to) return;

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
        <img src="https://kurdistan-hotels.vercel.app/api/logo" alt="Kurdistan Hotels" width="240" style="width:240px;max-width:80%;height:auto;" />
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
      </div>
      <div style="background:#f1f5f9;padding:14px;text-align:center;color:#94a3b8;font-size:12px;">
        Kurdistan Hotels — هۆتێلەکانی کوردستان
      </div>
    </div>
  </div>`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Kurdistan Hotels" <${user}>`,
      to,
      subject: `حیجزی نوێ — ${b.hotel} (${money(total)})`,
      html,
    });
  } catch {
    /* best-effort — a failed email must never block a booking */
  }
}
