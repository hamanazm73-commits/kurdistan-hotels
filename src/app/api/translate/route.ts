import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  q: z.string().min(1).max(2000),
  to: z.enum(["ckb", "kmr", "en", "ar"]),
  from: z.enum(["ckb", "kmr", "en", "ar"]).optional(),
});

// our language code -> Google Translate code
const GT: Record<string, string> = { ckb: "ckb", kmr: "ku", en: "en", ar: "ar" };

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`translate:${ip}`, { limit: 40, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { q, to, from } = parsed.data;
  const sl = from ? GT[from] : "auto";
  const tl = GT[to];
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx` +
    `&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(q)}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return NextResponse.json({ error: "translate_failed" }, { status: 502 });
    }
    const data = (await res.json()) as unknown;
    // data[0] is an array of segments; each segment[0] is the translated text
    const segments =
      Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
    const text = segments
      .map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : ""))
      .join("");
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "translate_failed" }, { status: 502 });
  }
}
