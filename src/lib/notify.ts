import "server-only";
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
