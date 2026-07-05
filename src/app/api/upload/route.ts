import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Generates a short-lived token so the browser can upload a hotel image/video
 * straight to Vercel Blob (bypassing the 4.5 MB serverless body limit).
 *
 * The caller sends its Firebase ID token as `clientPayload`; we verify it via
 * the Identity Toolkit REST API. Doing it over REST (instead of firebase-admin)
 * keeps this route free of the Admin SDK, which otherwise fails to load in the
 * serverless function and 500s the whole endpoint.
 */
async function isSignedIn(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  // If no API key is configured we can't verify — allow (dev / self-host).
  if (!apiKey) return true;
  if (!idToken) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { users?: unknown[] };
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!(await isSignedIn(clientPayload ?? "")))
          throw new Error("not signed in");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        /* nothing to do — the URL is returned to the client */
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "upload-failed" },
      { status: 400 },
    );
  }
}
