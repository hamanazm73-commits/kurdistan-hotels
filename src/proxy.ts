import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Serve every public page under a language path — /ar/hotels/x, /en/map — by
 * rewriting to the existing route with `?lang=`, which the i18n provider
 * already reads.
 *
 * Rewriting rather than moving files means no existing URL changes: the bare
 * paths keep working exactly as before, and Google gets a real, indexable path
 * per language instead of a query string it tends to fold together.
 *
 * Admin and auth routes are deliberately excluded — nobody links to /hq from a
 * search result, and prefixing it would only complicate the owner's login.
 */
const LANGS = ["ckb", "kmr", "en", "ar"] as const;

/** Paths that must never carry a language prefix. */
const PRIVATE = ["/hq", "/access", "/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const seg = pathname.split("/")[1];
  if (!(LANGS as readonly string[]).includes(seg)) return NextResponse.next();

  // strip the prefix: "/ar/hotels/x" -> "/hotels/x", "/ar" -> "/"
  const rest = pathname.slice(seg.length + 1) || "/";
  if (PRIVATE.some((p) => rest === p || rest.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL(rest + search, request.url));
  }

  const url = request.nextUrl.clone();
  url.pathname = rest;
  url.searchParams.set("lang", seg);
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except API routes, Next internals and files with an extension
  matcher: ["/((?!api|_next/static|_next/image|.*\\.).*)"],
};
