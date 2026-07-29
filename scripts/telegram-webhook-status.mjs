import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const token = env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log("no TELEGRAM_BOT_TOKEN locally");
  process.exit(0);
}

const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
const j = await r.json();
const i = j.result ?? {};
console.log(
  JSON.stringify(
    {
      webhookRegistered: !!i.url,
      url: i.url || "(none)",
      hasCustomCertificate: i.has_custom_certificate,
      pendingUpdates: i.pending_update_count,
      lastErrorDate: i.last_error_date
        ? new Date(i.last_error_date * 1000).toISOString()
        : null,
      lastErrorMessage: i.last_error_message ?? null,
      allowedUpdates: i.allowed_updates ?? "(default)",
      secretTokenConfigured: !!i.secret_token, // telegram doesn't return it; informational
    },
    null,
    2,
  ),
);
console.log("chatId configured locally:", env.TELEGRAM_CHAT_ID ? "yes" : "no");
console.log("webhook secret configured locally:", env.TELEGRAM_WEBHOOK_SECRET ? "yes" : "NO");
process.exit(0);
