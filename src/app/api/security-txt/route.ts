export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Served at /.well-known/security.txt (via a rewrite in next.config).
 * RFC 9116 security contact. The contact address is read from the same
 * configured owner/mail address the site already uses, so it never needs to
 * be hard-coded and stays correct if that address changes.
 */
export function GET() {
  const email =
    process.env.NEXT_PUBLIC_OWNER_EMAIL ||
    process.env.OWNER_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    "";
  const contact = email ? `mailto:${email}` : "https://hotelskurdistan.com";
  const expires = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const body = [
    "# Security contact for Kurdistan Hotels (hotelskurdistan.com)",
    `Contact: ${contact}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en, ckb, ar",
    "Canonical: https://hotelskurdistan.com/.well-known/security.txt",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
