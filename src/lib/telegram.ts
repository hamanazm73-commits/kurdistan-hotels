import "server-only";
import { createHash } from "crypto";

const API = "https://api.telegram.org";

/** Public origin of this deployment, for registering the webhook URL. */
function siteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "https://hotelskurdistan.com";
}

/**
 * The secret Telegram echoes back on every update. Derived from the bot token
 * when none is configured, so button presses work with no extra setup — and
 * it stays secret, because only someone with the token could compute it.
 */
export function webhookSecret(): string {
  const explicit = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (explicit) return explicit;
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!token) return "";
  return createHash("sha256").update(`tg-webhook:${token}`).digest("hex").slice(0, 48);
}

// Registering is idempotent but pointless to repeat, so do it once per instance.
let webhookChecked = false;

/**
 * Make sure Telegram knows where to deliver button presses. Without this the
 * approve/reject buttons render but do nothing, since Telegram has nowhere to
 * send the callback. Best-effort: never throws, never blocks the caller.
 */
export async function ensureWebhook(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = webhookSecret();
  if (!token || !secret || webhookChecked) return;
  webhookChecked = true;
  const want = `${siteOrigin()}/api/telegram/webhook`;
  try {
    const info = await (
      await fetch(`${API}/bot${token}/getWebhookInfo`)
    ).json();
    if (info?.result?.url === want) return;
    await tgSetWebhook(want, secret);
  } catch {
    webhookChecked = false; // let a later call retry
  }
}

/** Telegram notifications are on only when a bot token is configured. */
export function telegramEnabled(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Send a message to a chat. Returns true on success. No-ops without config. */
export async function tgSend(
  chatId: string | number,
  text: string,
  extra?: Record<string, unknown>,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...extra,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Notify the site owner about a new pending review, with approve/reject buttons. */
export async function notifyNewReview(input: {
  id: string;
  hotelName: string;
  name: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return;
  // the message carries buttons, so make sure presses have somewhere to land
  await ensureWebhook();
  const stars = "⭐".repeat(Math.max(1, Math.min(5, Math.round(input.rating))));
  const text =
    `🆕 <b>هەڵسەنگاندنی نوێ</b>\n` +
    `🏨 ${esc(input.hotelName)}\n` +
    `👤 ${esc(input.name)}\n` +
    `${stars} (${input.rating}/5)\n\n` +
    `💬 ${esc(input.comment)}`;
  await tgSend(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ پەسەند", callback_data: `rv_ok:${input.id}` },
          { text: "❌ ڕەت", callback_data: `rv_no:${input.id}` },
        ],
      ],
    },
  });
}

/** Acknowledge a pressed inline button (shows a small toast in Telegram). */
export async function tgAnswerCallback(
  callbackId: string,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`${API}/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text }),
    });
  } catch {
    /* ignore */
  }
}

/** Replace a message's text (plain) and clear its inline buttons. */
export async function tgEditText(
  chatId: string | number,
  messageId: number,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`${API}/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        reply_markup: { inline_keyboard: [] },
      }),
    });
  } catch {
    /* ignore */
  }
}

/** Register the webhook so Telegram forwards button presses to our route. */
export async function tgSetWebhook(
  url: string,
  secret: string,
): Promise<unknown> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "no_token" };
  const res = await fetch(`${API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  return res.json();
}
