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

  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:6px 12px;color:#666;">${label}</td><td style="padding:6px 12px;font-weight:600;">${esc(value)}</td></tr>`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;">
      <h2 style="color:#1e3a5f;">🏨 حیجزی نوێ — New booking</h2>
      <table style="border-collapse:collapse;width:100%;background:#f8f8f8;border-radius:8px;">
        ${row("هۆتێل / Hotel", b.hotel)}
        ${row("ناو / Name", b.name)}
        ${row("تەلەفۆن / Phone", b.phone)}
        ${row("ژوور / Room", b.roomType)}
        ${row("بەروار / Check-in", b.checkIn)}
        ${row("شەو / Nights", b.nights)}
      </table>
    </div>`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Kurdistan Hotels" <${user}>`,
      to,
      subject: `حیجزی نوێ — ${b.hotel}`,
      html,
    });
  } catch {
    /* best-effort — a failed email must never block a booking */
  }
}
