import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * Generates a short-lived token so the browser can upload a hotel image/video
 * straight to Vercel Blob (bypassing the 4.5 MB serverless body limit).
 *
 * The client sends its Firebase ID token as `clientPayload`; we verify the
 * caller is a signed-in user before issuing the upload token.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const auth = getAdminAuth();
        // If admin creds are configured, require a valid signed-in user.
        if (auth) {
          if (!clientPayload) throw new Error("not signed in");
          await auth.verifyIdToken(clientPayload);
        }
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
