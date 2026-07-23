import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  tgAnswerCallback,
  tgEditText,
  tgSend,
  tgSetWebhook,
} from "@/lib/telegram";

export const runtime = "nodejs";

interface TgUpdate {
  message?: {
    text?: string;
    chat: { id: number | string };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id: number | string };
    message?: {
      message_id: number;
      text?: string;
      chat: { id: number | string };
    };
  };
}

/**
 * One-time setup. Visiting
 *   /api/telegram/webhook?setup=<TELEGRAM_WEBHOOK_SECRET>
 * registers this route as the bot's webhook, so button presses reach us.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get("setup") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const hookUrl = `${url.origin}/api/telegram/webhook`;
  const result = await tgSetWebhook(hookUrl, secret);
  return NextResponse.json({ registered: hookUrl, result });
}

/** Telegram calls this on every message / button press. */
export async function POST(req: Request) {
  // Reject spoofed calls: Telegram echoes our secret in this header.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== secret) return NextResponse.json({ ok: true });
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const ownerChatId = process.env.TELEGRAM_CHAT_ID;

  // Bootstrap helper: message the bot "/id" (or "/start") and it replies with
  // your chat id — that's the value for TELEGRAM_CHAT_ID.
  const msg = update.message;
  if (msg && typeof msg.text === "string") {
    const text = msg.text.trim();
    if (text === "/id" || text === "/start") {
      await tgSend(msg.chat.id, `Chat ID: <code>${msg.chat.id}</code>`);
    }
    return NextResponse.json({ ok: true });
  }

  // Approve / reject button press.
  const cq = update.callback_query;
  if (cq) {
    // Only the configured owner may moderate.
    if (!ownerChatId || String(cq.from?.id) !== String(ownerChatId)) {
      await tgAnswerCallback(cq.id, "⛔");
      return NextResponse.json({ ok: true });
    }
    const m = (cq.data || "").match(/^rv_(ok|no):(.+)$/);
    if (!m) {
      await tgAnswerCallback(cq.id, "");
      return NextResponse.json({ ok: true });
    }
    const status = m[1] === "ok" ? "approved" : "rejected";
    const id = m[2];

    const db = getAdminDb();
    if (db) {
      try {
        await db.collection("reviews").doc(id).update({ status });
      } catch {
        /* ignore — review may have been removed */
      }
    }

    await tgAnswerCallback(
      cq.id,
      status === "approved" ? "✅ پەسەند کرا" : "❌ ڕەت کرایەوە",
    );
    if (cq.message) {
      const tag =
        status === "approved" ? "\n\n✅ پەسەندکرا" : "\n\n❌ ڕەتکرایەوە";
      await tgEditText(
        cq.message.chat.id,
        cq.message.message_id,
        (cq.message.text || "") + tag,
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
